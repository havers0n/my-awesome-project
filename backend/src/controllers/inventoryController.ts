import { Request, Response } from 'express';
import { getSupabaseUserClient } from '../supabaseUserClient';
import { z } from 'zod';


// Helper to get organization_id from user
const getOrgId = (req: Request): number | null => {
    const user = (req as any).user;
    return user?.organization_id || null;
};

// Zod schemas for validation
const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    category: z.string().optional(),
    shelf: z.string().optional(),
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
    price: z.number().min(0, 'Price cannot be negative').optional(),
});

const quantityUpdateSchema = z.object({
    quantity: z.number().int().min(0, 'New quantity cannot be negative'),
    type: z.enum(['Поступление', 'Списание', 'Коррекция', 'Отчет о нехватке']),
});

// GET /products - Get all products for an organization
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    // ---- НАШ ЛОГ ДЛЯ ПРОВЕРКИ ----
    console.log('✅✅✅ УРА! Запрос дошел до НАСТОЯЩЕГО контроллера getProducts! ✅✅✅');
    console.log('Данные пользователя, полученные из токена (req.user):', (req as any).user);
    // ---- КОНЕЦ ЛОГА ----

    const organizationId = getOrgId(req);
    if (!organizationId) {
        // Добавим лог и здесь для ясности
        console.error('❌ ОШИБКА: Не удалось получить organizationId из req.user');
        res.status(401).json({ error: 'User is not associated with an organization.' });
        return;
    }

    console.log(`Ищем продукты для organizationId: ${organizationId}`); // <-- Еще один полезный лог

    const supabase = getSupabaseUserClient(req.headers['authorization']!.replace('Bearer ', ''));

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('organization_id', organizationId)
            .order('name', { ascending: true });

        if (error) {
            console.error('❌ Ошибка от Supabase при получении продуктов:', error);
            throw error;
        }

        console.log(`✅ Найдено ${data.length} продуктов для организации ${organizationId}`); // <-- Супер полезный лог!
        
        const productsWithHistory = data.map(p => ({ ...p, history: [] }));

        res.json(productsWithHistory);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('❌ Ошибка в блоке catch контроллера getProducts:', message);
        res.status(500).json({ error: 'Failed to fetch products', details: message });
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
            .insert([{ ...productData, organization_id: organizationId }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
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
            .update(productData)
            .eq('id', id)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            res.status(404).json({ error: 'Product not found or access denied.' });
            return;
        }

        res.json(data);
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

        // In a real app, this should be a transaction
        // 1. Update product quantity
        const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update({ quantity })
            .eq('id', id)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (updateError) throw updateError;
        if (!updatedProduct) {
            res.status(404).json({ error: 'Product not found or access denied.' });
            return;
        }

        // 2. Log the change to operations/history table
        const { error: historyError } = await supabase
            .from('operations') // Assuming the table is called 'operations'
            .insert({
                product_id: id,
                organization_id: organizationId,
                operation_type: type, // Should map frontend types to backend enum
                quantity_change: quantity - updatedProduct.quantity, // This logic is simplified
                operation_date: new Date().toISOString(),
            });

        if (historyError) {
          // Log the error but don't fail the whole request, as the primary update succeeded.
          console.error("Failed to log quantity update history:", historyError);
        }

        res.json(updatedProduct);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
         if (err instanceof z.ZodError) {
            res.status(400).json({ error: 'Invalid quantity update data', details: err.errors });
            return;
        }
        res.status(500).json({ error: 'Failed to update product quantity', details: message });
    }
}; 