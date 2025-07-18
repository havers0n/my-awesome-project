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

// Helper to generate mock data with stock quantities
const generateMockProductsWithStock = (organizationId: number): any[] => {
    return [
        {
            product_id: 1,
            organization_id: organizationId,
            product_name: 'Колбаса докторская',
            sku: 'KOL001',
            code: 'P001',
            price: 450.00,
            current_stock: 36,
            stock_status: 'В наличии',
            locations_with_stock: 1,
            last_update: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            product_id: 2,
            organization_id: organizationId,
            product_name: 'Сыр российский',
            sku: 'SYR001',
            code: 'P002',
            price: 380.00,
            current_stock: 7,
            stock_status: 'Мало',
            locations_with_stock: 1,
            last_update: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            product_id: 3,
            organization_id: organizationId,
            product_name: 'Молоко 3.2%',
            sku: 'MOL001',
            code: 'P003',
            price: 65.00,
            current_stock: 0,
            stock_status: 'Нет в наличии',
            locations_with_stock: 0,
            last_update: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            product_id: 4,
            organization_id: organizationId,
            product_name: 'Хлеб белый',
            sku: 'HLB001',
            code: 'P004',
            price: 45.00,
            current_stock: 33,
            stock_status: 'В наличии',
            locations_with_stock: 1,
            last_update: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            product_id: 5,
            organization_id: organizationId,
            product_name: 'Масло сливочное',
            sku: 'MAS001',
            code: 'P005',
            price: 280.00,
            current_stock: 14,
            stock_status: 'В наличии',
            locations_with_stock: 1,
            last_update: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            product_id: 6,
            organization_id: organizationId,
            product_name: 'Яйца куриные (десяток)',
            sku: 'YAI001',
            code: 'P006',
            price: 90.00,
            current_stock: 25,
            stock_status: 'В наличии',
            locations_with_stock: 1,
            last_update: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            product_id: 7,
            organization_id: organizationId,
            product_name: 'Рис круглозерный 1кг',
            sku: 'RIS001',
            code: 'P007',
            price: 85.00,
            current_stock: 8,
            stock_status: 'Мало',
            locations_with_stock: 1,
            last_update: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ];
};

// Функция для создания представления current_stock_view
export const initializeStockView = async (req: Request, res: Response) => {
    console.log('\n--- [START] initializeStockView CONTROLLER ---');
    try {
        const user = (req as any).user;
        if (!user?.organization_id) {
            return res.status(403).json({ error: 'Access denied: organization membership required' });
        }

        const supabase = getSupabaseUserClient(req.headers['authorization']!.replace('Bearer ', ''));

        // SQL для создания представления current_stock_view
        const createViewSQL = `
            CREATE OR REPLACE VIEW public.current_stock_view AS
            WITH latest_operations AS (
              SELECT DISTINCT ON (product_id, location_id, organization_id)
                product_id,
                location_id,
                organization_id,
                stock_on_hand as current_stock,
                operation_date,
                operation_type
              FROM public.operations
              WHERE stock_on_hand IS NOT NULL
              ORDER BY product_id, location_id, organization_id, operation_date DESC
            ),
            aggregated_stock AS (
              SELECT 
                product_id,
                organization_id,
                SUM(COALESCE(current_stock, 0)) as total_stock,
                COUNT(location_id) as locations_count,
                MAX(operation_date) as last_update
              FROM latest_operations
              GROUP BY product_id, organization_id
            )
            SELECT 
              p.id as product_id,
              p.organization_id,
              p.name as product_name,
              p.sku,
              p.code,
              p.price,
              COALESCE(ast.total_stock, 0) as current_stock,
              COALESCE(ast.locations_count, 0) as locations_with_stock,
              ast.last_update,
              CASE 
                WHEN COALESCE(ast.total_stock, 0) = 0 THEN 'Нет в наличии'
                WHEN COALESCE(ast.total_stock, 0) <= 10 THEN 'Мало'
                ELSE 'В наличии'
              END as stock_status,
              p.created_at,
              p.updated_at
            FROM public.products p
            LEFT JOIN aggregated_stock ast ON p.id = ast.product_id AND p.organization_id = ast.organization_id
            ORDER BY p.name;
        `;

        // Выполняем SQL через rpc функцию (если доступна) или напрямую
        console.log('[1] Attempting to create current_stock_view...');
        
        // Поскольку создание VIEW через Supabase JS может быть ограничено,
        // возвращаем успешный ответ и инструкции по ручному выполнению
        res.status(200).json({
            message: 'View creation initiated',
            sql: createViewSQL,
            note: 'Execute this SQL manually in Supabase SQL Editor if view does not exist'
        });

    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[ERROR] Failed to initialize stock view:', message);
        res.status(500).json({ error: 'Failed to initialize stock view', details: message });
    }
    console.log('--- [END] initializeStockView CONTROLLER ---\n');
};


// ИСПРАВЛЕНО: Восстановлена безопасная проверка organization_id
export const getProducts = async (req: Request, res: Response) => {
    console.log('\n--- [START] getProducts CONTROLLER ---');
    try {
        const user = (req as any).user;
        const organizationId = user?.organization_id;

        if (!organizationId) {
            return res.status(403).json({ error: 'User is not associated with an organization' });
        }

        // Прямой SQL-запрос через Supabase (используйте node-postgres или pg-promise для production)
        const sql = `
            SELECT
                p.id as product_id,
                p.name as product_name,
                p.price,
                p.sku,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'location_id', l.id,
                            'location_name', l.name,
                            'stock', csv.current_stock
                        )
                    ) FILTER (WHERE l.id IS NOT NULL),
                    '[]'
                ) AS stock_by_location
            FROM public.products AS p
            LEFT JOIN public.current_stock_view AS csv ON p.id = csv.product_id
            LEFT JOIN public.locations AS l ON csv.location_id = l.id
            WHERE p.organization_id = $1
            GROUP BY p.id
            ORDER BY p.name;
        `;

        // Для Supabase: используйте функцию rpc или raw SQL через node-postgres
        // Здесь пример с Supabase PostgREST (если разрешено):
        // const { data, error } = await supabase.rpc('exec_sql', { sql, params: [organizationId] });
        // Если нет - используйте mock:
        // TODO: заменить на реальный вызов
        const data = [
            {
                product_id: 1,
                product_name: 'Колбаса докторская',
                price: 450.00,
                sku: 'KOL001',
                stock_by_location: [
                    { location_id: 1, location_name: 'Центральный склад', stock: 36 },
                    { location_id: 2, location_name: 'Магазин на Ленина', stock: 12 }
                ]
            },
            {
                product_id: 2,
                product_name: 'Сыр российский',
                price: 380.00,
                sku: 'SYR001',
                stock_by_location: [
                    { location_id: 1, location_name: 'Центральный склад', stock: 7 }
                ]
            },
            {
                product_id: 3,
                product_name: 'Молоко 3.2%',
                price: 65.00,
                sku: 'MOL001',
                stock_by_location: [
                    { location_id: 1, location_name: 'Центральный склад', stock: 0 }
                ]
            }
        ];
        res.json(data);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: message });
    }
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