import { Request, Response } from 'express';

import { getSupabaseUserClient } from '../supabaseUserClient';
import { z } from 'zod';

// Zod schemas for validation
const productSchema = z.object({
    product_name: z.string().min(1, 'Product name is required'),
    sku: z.string().min(1, 'SKU is required'),
    price: z.number().min(0, 'Price cannot be negative'),
});

const quantityUpdateSchema = z.object({
    quantity: z.number().int().min(0, 'New quantity cannot be negative'),
    type: z.enum(['Поступление', 'Списание', 'Коррекция', 'Отчет о нехватке']),
});

// Helper to get organization_id from user
const getOrgId = (req: Request): number | null => {
    const user = (req as any).user;
    return user?.organization_id || null;
};

// УБРАНО: mock данные больше не нужны, работаем только с реальными данными из VIEW

// УБРАНО: initializeStockView - VIEW должны создаваться миграциями, а не через API


// ИСПРАВЛЕНО: Стандартный и правильный JOIN в Supabase
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    console.log('\n--- [START] getProducts CONTROLLER (CORRECT JOIN) ---');
    try {
        const user = (req as any).user;
        let organizationId = user?.organization_id;

        if (!organizationId) {
            console.log('⚠️ No organization_id found, using default organization_id = 1');
            organizationId = 1;
        }

        console.log(`📊 Fetching data for organization_id: ${organizationId}`);

        const supabase = getSupabaseUserClient(req.headers['authorization']?.replace('Bearer ', '') || process.env.SUPABASE_SERVICE_ROLE_KEY || '');

        // ИСПРАВЛЕНО: Простой и надежный запрос к current_stock_view (содержит ВСЕ нужные данные)
        console.log('🔧 Using direct query to current_stock_view (contains all product data)');
        
        const { data, error } = await supabase
            .from('current_stock_view')
            .select('*')
            .eq('organization_id', organizationId)
            .order('product_name');

        if (error) {
            console.error('❌ current_stock_view query error:', error);
            res.status(500).json({ error: 'Failed to fetch products with stock', details: error.message });
            return;
        }

        if (!data || data.length === 0) {
            console.log('⚠️ No stock data found, returning empty result');
            res.json({ data: [], pagination: { page: 1, limit: 100, total: 0 } });
            return;
        }

        console.log(`✅ Direct query successful: Found ${data.length} products with stock data`);

        // Получаем детализацию по локациям отдельно
        const { data: locationStockData, error: locationError } = await supabase
            .from('stock_by_location_view')
            .select('*')
            .eq('organization_id', organizationId);

        if (locationError) {
            console.warn('⚠️ Could not fetch location details:', locationError.message);
        }

        // ИСПРАВЛЕНО: current_stock_view уже содержит ВСЕ данные (продукты + остатки)
        const formattedProducts = data.map((item: any) => {
            // Находим остатки по локациям для этого продукта
            const stockByLocation = (locationStockData || [])
                .filter((loc: any) => loc.product_id === item.product_id)
                .map((loc: any) => ({
                    location_id: loc.location_id,
                    location_name: loc.location_name,
                    stock: Number(loc.stock) || 0
                }));

            return {
                product_id: item.product_id,
                product_name: item.product_name,
                sku: item.sku,
                code: item.code,
                price: Number(item.price) || 0,
                stock_by_location: stockByLocation,
                created_at: item.created_at,
                updated_at: item.updated_at,
                // Поля остатков уже есть в current_stock_view
                current_stock: Number(item.current_stock) || 0,
                stock_status: item.stock_status || 'Нет данных',
                locations_with_stock: Number(item.locations_with_stock) || 0
            };
        });

        console.log(`✅ Successfully formatted ${formattedProducts.length} products with direct query data`);

        // Логируем первые несколько товаров для проверки
        if (formattedProducts.length > 0) {
            console.log('📦 Sample products with stock:');
            formattedProducts.slice(0, 3).forEach((product, index) => {
                console.log(`  ${index + 1}. ${product.product_name}: stock=${product.current_stock}, status=${product.stock_status}`);
            });
        }

        res.json({
            data: formattedProducts,
            pagination: {
                page: 1,
                limit: 100,
                total: formattedProducts.length
            }
        });
        return;

    } catch (error) {
        console.error('💥 Error in getProducts:', error);
        res.status(500).json({ 
            error: 'Failed to fetch products', 
            details: error instanceof Error ? error.message : String(error) 
        });
        return;
    }
    console.log('--- [END] getProducts CONTROLLER ---\n');
};

// POST /products - Create a new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    const organizationId = getOrgId(req);
    if (!organizationId) {
        res.status(401).json({ error: 'User is not associated with an organization.' });
        return;
    }

    try {
        const productData = productSchema.parse(req.body);
        const supabase = getSupabaseUserClient(req.headers['authorization']!.replace('Bearer ', ''));

        const { data, error } = await supabase
            .from('products')
            .insert([{ 
                name: productData.product_name,
                sku: productData.sku,
                price: productData.price,
                organization_id: organizationId 
            }])
            .select()
            .single();

        if (error) throw error;

        // Возвращаем данные в формате ожидаемом фронтендом
        const responseData = {
            product_id: data.id,
            product_name: data.name,
            sku: data.sku,
            price: data.price,
            stock_by_location: []
        };

        res.status(201).json(responseData);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: 'Invalid product data', details: err.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to create product', details: message });
    }
};

// PUT /products/:id - Update a product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const organizationId = getOrgId(req);
    if (!organizationId) {
        res.status(401).json({ error: 'User is not associated with an organization.' });
        return;
    }
    
    try {
        const productData = productSchema.parse(req.body);
        const supabase = getSupabaseUserClient(req.headers['authorization']!.replace('Bearer ', ''));

        const { data, error } = await supabase
            .from('products')
            .update({
                name: productData.product_name,
                sku: productData.sku,
                price: productData.price
            })
            .eq('id', id)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            res.status(404).json({ error: 'Product not found or access denied.' });
            return;
        }

        // Возвращаем данные в формате ожидаемом фронтендом
        const responseData = {
            product_id: data.id,
            product_name: data.name,
            sku: data.sku,
            price: data.price,
            stock_by_location: [] // Здесь нужно будет получить актуальные остатки
        };

        res.json(responseData);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
         if (err instanceof z.ZodError) {
            res.status(400).json({ error: 'Invalid product data', details: err.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to update product', details: message });
    }
};

// DELETE /products/:id - Delete a product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const organizationId = getOrgId(req);
    if (!organizationId) {
        res.status(401).json({ error: 'User is not associated with an organization.' });
        return;
    }

    const supabase = getSupabaseUserClient(req.headers['authorization']!.replace('Bearer ', ''));

    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
            .eq('organization_id', organizationId);

        if (error) throw error;

        res.status(204).send();
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: 'Failed to delete product', details: message });
    }
};

// PUT /products/:id/quantity - A more specific update for quantity and logging history
export const updateProductQuantity = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const organizationId = getOrgId(req);
    if (!organizationId) {
        res.status(401).json({ error: 'User is not associated with an organization.' });
        return;
    }
    
    try {
        const { quantity, type } = quantityUpdateSchema.parse(req.body);
        const supabase = getSupabaseUserClient(req.headers['authorization']!.replace('Bearer ', ''));

        // В реальном приложении это должно быть в транзакции
        // 1. Получаем текущий продукт
        const { data: currentProduct, error: fetchError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .eq('organization_id', organizationId)
            .single();

        if (fetchError) throw fetchError;
        if (!currentProduct) {
            res.status(404).json({ error: 'Product not found or access denied.' });
            return;
        }

        // 2. Записываем операцию в таблицу operations
        const { error: operationError } = await supabase
            .from('operations')
            .insert({
                product_id: id,
                organization_id: organizationId,
                operation_type: type,
                quantity: quantity,
                operation_date: new Date().toISOString(),
                location_id: 1, // Заглушка для location_id - в реальности должен передаваться
                stock_on_hand: quantity
            });

        if (operationError) {
          console.error("Failed to log operation:", operationError);
          // Не останавливаем выполнение, так как основная операция может быть успешной
        }

        // 3. Возвращаем обновленные данные продукта
        const responseData = {
            product_id: currentProduct.id,
            product_name: currentProduct.name,
            sku: currentProduct.sku,
            price: currentProduct.price,
            stock_by_location: [] // Здесь нужно будет получить актуальные остатки
        };

        res.json(responseData);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
         if (err instanceof z.ZodError) {
            res.status(400).json({ error: 'Invalid quantity update data', details: err.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to update product quantity', details: message });
    }
}; 

// GET /products/:id/operations - Get operations history for a specific product
export const getProductOperations = async (req: Request, res: Response): Promise<void> => {
    console.log('\n--- [START] getProductOperations CONTROLLER ---');
    
    try {
        const { id: productId } = req.params;
        const user = (req as any).user;
        let organizationId = user?.organization_id;

        // ВРЕМЕННО: если нет пользователя, используем организацию по умолчанию
        if (!organizationId) {
            console.log('⚠️ No organization_id found, using default organization_id = 1');
            organizationId = 1;
        }

        console.log(`📊 Fetching operations for product ${productId}, organization: ${organizationId}`);

        const supabase = getSupabaseUserClient(req.headers['authorization']?.replace('Bearer ', '') || process.env.SUPABASE_SERVICE_ROLE_KEY || '');

        // Получаем операции для конкретного товара
        const { data: operations, error } = await supabase
            .from('operations')
            .select(`
                id,
                operation_type,
                operation_date,
                quantity,
                total_amount,
                cost_price,
                shelf_price,
                stock_on_hand,
                delivery_delay_days,
                was_out_of_stock,
                created_at,
                locations (
                    id,
                    name
                ),
                suppliers (
                    id,
                    name
                )
            `)
            .eq('product_id', productId)
            .eq('organization_id', organizationId)
            .order('operation_date', { ascending: false })
            .limit(50);

        if (error) {
            console.error('❌ Database error:', error);
            res.status(500).json({ error: 'Database query failed', details: error.message });
            return;
        }

        // Форматируем данные для frontend
        const formattedOperations = (operations || []).map(op => ({
            id: op.id,
            type: op.operation_type,
            date: op.operation_date,
            quantity: op.quantity,
            totalAmount: op.total_amount,
            costPrice: op.cost_price,
            shelfPrice: op.shelf_price,
            stockOnHand: op.stock_on_hand,
            deliveryDelayDays: op.delivery_delay_days,
            wasOutOfStock: op.was_out_of_stock,
            location: (op.locations as any) ? {
                id: (op.locations as any).id,
                name: (op.locations as any).name
            } : null,
            supplier: (op.suppliers as any) ? {
                id: (op.suppliers as any).id,
                name: (op.suppliers as any).name
            } : null,
            createdAt: op.created_at
        }));

        console.log(`✅ Successfully fetched ${formattedOperations.length} operations for product ${productId}`);

        res.json({
            productId: parseInt(productId),
            operations: formattedOperations,
            total: formattedOperations.length
        });

    } catch (error) {
        console.error('💥 Error in getProductOperations:', error);
        res.status(500).json({ 
            error: 'Failed to fetch product operations', 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
    
    console.log('--- [END] getProductOperations CONTROLLER ---\n');
};

// GET /suppliers - Get all suppliers for organization
export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
    console.log('\n--- [START] getSuppliers CONTROLLER ---');
    
    try {
        const user = (req as any).user;
        let organizationId = user?.organization_id;

        // ВРЕМЕННО: если нет пользователя, используем организацию по умолчанию
        if (!organizationId) {
            console.log('⚠️ No organization_id found, using default organization_id = 1');
            organizationId = 1;
        }

        console.log(`📊 Fetching suppliers for organization: ${organizationId}`);

        const supabase = getSupabaseUserClient(req.headers['authorization']?.replace('Bearer ', '') || process.env.SUPABASE_SERVICE_ROLE_KEY || '');

        // Получаем всех поставщиков организации
        const { data: suppliers, error } = await supabase
            .from('suppliers')
            .select(`
                id,
                name,
                created_at,
                updated_at
            `)
            .eq('organization_id', organizationId)
            .order('name');

        if (error) {
            console.error('❌ Database error:', error);
            res.status(500).json({ error: 'Database query failed', details: error.message });
            return;
        }

        console.log(`✅ Successfully fetched ${suppliers?.length || 0} suppliers`);

        res.json(suppliers || []);

    } catch (error) {
        console.error('💥 Error in getSuppliers:', error);
        res.status(500).json({ 
            error: 'Failed to fetch suppliers', 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
    
    console.log('--- [END] getSuppliers CONTROLLER ---\n');
};

// GET /suppliers/:id/delivery-info - Get delivery information for a supplier
export const getSupplierDeliveryInfo = async (req: Request, res: Response): Promise<void> => {
    console.log('\n--- [START] getSupplierDeliveryInfo CONTROLLER ---');
    
    try {
        const { id: supplierId } = req.params;
        const user = (req as any).user;
        let organizationId = user?.organization_id;

        // ВРЕМЕННО: если нет пользователя, используем организацию по умолчанию
        if (!organizationId) {
            console.log('⚠️ No organization_id found, using default organization_id = 1');
            organizationId = 1;
        }

        console.log(`📊 Fetching delivery info for supplier ${supplierId}, organization: ${organizationId}`);

        const supabase = getSupabaseUserClient(req.headers['authorization']?.replace('Bearer ', '') || process.env.SUPABASE_SERVICE_ROLE_KEY || '');

        // Получаем информацию о доставках от поставщика (из операций)
        const { data: deliveryData, error } = await supabase
            .from('operations')
            .select(`
                operation_date,
                delivery_delay_days,
                quantity,
                total_amount,
                cost_price,
                products (
                    id,
                    name
                )
            `)
            .eq('supplier_id', supplierId)
            .eq('organization_id', organizationId)
            .eq('operation_type', 'purchase')
            .order('operation_date', { ascending: false })
            .limit(20);

        if (error) {
            console.error('❌ Database error:', error);
            res.status(500).json({ error: 'Database query failed', details: error.message });
            return;
        }

        // Аналитика по поставщику
        const deliveries = deliveryData || [];
        const analytics = {
            totalDeliveries: deliveries.length,
            averageDelay: deliveries.length > 0 
                ? deliveries.reduce((sum: number, d: any) => sum + (d.delivery_delay_days || 0), 0) / deliveries.length 
                : 0,
            totalAmount: deliveries.reduce((sum: number, d: any) => sum + (d.total_amount || 0), 0),
            onTimeDeliveries: deliveries.filter(d => (d.delivery_delay_days || 0) === 0).length,
            delayedDeliveries: deliveries.filter(d => (d.delivery_delay_days || 0) > 0).length,
            recentDeliveries: deliveries.slice(0, 10).map(d => ({
                date: d.operation_date,
                delay: d.delivery_delay_days || 0,
                amount: d.total_amount || 0,
                product: (d.products as any) ? {
                    id: (d.products as any).id,
                    name: (d.products as any).name
                } : null
            }))
        };

        console.log(`✅ Successfully analyzed ${deliveries.length} deliveries for supplier ${supplierId}`);

        res.json({
            supplierId: parseInt(supplierId),
            analytics,
            deliveries: deliveries.map(d => ({
                date: d.operation_date,
                delay: d.delivery_delay_days || 0,
                quantity: d.quantity,
                amount: d.total_amount || 0,
                costPrice: d.cost_price || 0,
                product: (d.products as any) ? {
                    id: (d.products as any).id,
                    name: (d.products as any).name
                } : null
            }))
        });

    } catch (error) {
        console.error('💥 Error in getSupplierDeliveryInfo:', error);
        res.status(500).json({ 
            error: 'Failed to fetch supplier delivery info', 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
    
    console.log('--- [END] getSupplierDeliveryInfo CONTROLLER ---\n');
};

// GET /out-of-stock-reports - Get all out of stock reports
export const getOutOfStockReports = async (req: Request, res: Response): Promise<void> => {
    console.log('\n--- [START] getOutOfStockReports CONTROLLER ---');
    
    try {
        const user = (req as any).user;
        let organizationId = user?.organization_id;

        // ВРЕМЕННО: если нет пользователя, используем организацию по умолчанию
        if (!organizationId) {
            console.log('⚠️ No organization_id found, using default organization_id = 1');
            organizationId = 1;
        }

        console.log(`📊 Fetching out of stock reports for organization: ${organizationId}`);

        const supabase = getSupabaseUserClient(req.headers['authorization']?.replace('Bearer ', '') || process.env.SUPABASE_SERVICE_ROLE_KEY || '');

        // Получаем отчеты о нехватке
        const { data: reports, error } = await supabase
            .from('out_of_stock_items')
            .select(`
                id,
                quantity_needed,
                priority,
                notes,
                status,
                created_at,
                updated_at,
                products (
                    id,
                    name,
                    sku
                ),
                locations (
                    id,
                    name
                ),
                users!out_of_stock_items_user_id_fkey (
                    id,
                    full_name
                )
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('❌ Database error:', error);
            res.status(500).json({ error: 'Database query failed', details: error.message });
            return;
        }

        // Форматируем данные
        const formattedReports = (reports || []).map(report => ({
            id: report.id,
            quantityNeeded: report.quantity_needed,
            priority: report.priority,
            notes: report.notes,
            status: report.status,
            createdAt: report.created_at,
            updatedAt: report.updated_at,
            product: (report.products as any) ? {
                id: (report.products as any).id,
                name: (report.products as any).name,
                sku: (report.products as any).sku
            } : null,
            location: (report.locations as any) ? {
                id: (report.locations as any).id,
                name: (report.locations as any).name
            } : null,
            reporter: (report.users as any) ? {
                id: (report.users as any).id,
                name: (report.users as any).full_name
            } : null
        }));

        console.log(`✅ Successfully fetched ${formattedReports.length} out of stock reports`);

        res.json(formattedReports);

    } catch (error) {
        console.error('💥 Error in getOutOfStockReports:', error);
        res.status(500).json({ 
            error: 'Failed to fetch out of stock reports', 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
    
    console.log('--- [END] getOutOfStockReports CONTROLLER ---\n');
};

// POST /out-of-stock-reports - Create new out of stock report
export const createOutOfStockReport = async (req: Request, res: Response): Promise<void> => {
    console.log('\n--- [START] createOutOfStockReport CONTROLLER ---');
    
    try {
        const user = (req as any).user;
        const { productId, locationId, quantityNeeded, priority, notes } = req.body;

        if (!user || !user.id) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        console.log(`📊 Creating out of stock report for product ${productId}`);

        const supabase = getSupabaseUserClient(req.headers['authorization']?.replace('Bearer ', '') || process.env.SUPABASE_SERVICE_ROLE_KEY || '');

        // Создаем новый отчет
        const { data: newReport, error } = await supabase
            .from('out_of_stock_items')
            .insert({
                user_id: user.id,
                product_id: productId,
                location_id: locationId || 1, // Default location
                quantity_needed: quantityNeeded || 1,
                priority: priority || 'medium',
                notes: notes || '',
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Database error:', error);
            res.status(500).json({ error: 'Failed to create report', details: error.message });
            return;
        }

        console.log(`✅ Successfully created out of stock report ${newReport.id}`);

        res.status(201).json({
            id: newReport.id,
            message: 'Report created successfully'
        });

    } catch (error) {
        console.error('💥 Error in createOutOfStockReport:', error);
        res.status(500).json({ 
            error: 'Failed to create out of stock report', 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
    
    console.log('--- [END] createOutOfStockReport CONTROLLER ---\n');
};

// PUT /out-of-stock-reports/:id/status - Update report status
export const updateOutOfStockReportStatus = async (req: Request, res: Response): Promise<void> => {
    console.log('\n--- [START] updateOutOfStockReportStatus CONTROLLER ---');
    
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
            res.status(400).json({ error: 'Invalid status value' });
            return;
        }

        console.log(`📊 Updating report ${id} status to ${status}`);

        const supabase = getSupabaseUserClient(req.headers['authorization']?.replace('Bearer ', '') || process.env.SUPABASE_SERVICE_ROLE_KEY || '');

        const { data, error } = await supabase
            .from('out_of_stock_items')
            .update({ 
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('❌ Database error:', error);
            res.status(500).json({ error: 'Failed to update report status', details: error.message });
            return;
        }

        if (!data) {
            res.status(404).json({ error: 'Report not found' });
            return;
        }

        console.log(`✅ Successfully updated report ${id} status to ${status}`);

        res.json({
            id: data.id,
            status: data.status,
            message: 'Status updated successfully'
        });

    } catch (error) {
        console.error('💥 Error in updateOutOfStockReportStatus:', error);
        res.status(500).json({ 
            error: 'Failed to update report status', 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
    
    console.log('--- [END] updateOutOfStockReportStatus CONTROLLER ---\n');
}; 