import { Request, Response } from 'express';

import { getSupabaseUserClient } from '../supabaseUserClient';
import { z } from 'zod';



// !!! ЗАМЕНИТЕ ВАШУ ФУНКЦИЮ getProducts НА ЭТУ !!!
export const getProducts = async (req: Request, res: Response) => {
    console.log('\n--- [START] getProducts CONTROLLER ---');
    try {
        const user = (req as any).user;
        const organizationId = user?.organization_id;

        console.log(`[1] User object from middleware:`, JSON.stringify(user, null, 2));
        console.log(`[2] Extracted organization_id: |${organizationId}|`);

        // Используем ВАШ метод для получения клиента Supabase
        const supabase = getSupabaseUserClient(req.headers['authorization']!.replace('Bearer ', ''));

        let query = supabase
            .from('products')
            .select('*');

        if (organizationId) {
            console.log(`[3] Sending query to Supabase: SELECT * FROM products WHERE organization_id = ${organizationId}`);
            query = query.eq('organization_id', organizationId);
        } else {
            console.log('[3] No organization ID found. Fetching all products.');
        }

        const { data, error, status } = await query;

        console.log('\n--- [DATABASE RESPONSE] ---');
        console.log('Status Code:', status);
        console.log('Returned Data (first 3 items):', data ? data.slice(0, 3) : 'null');
        console.log('Returned Error:', error);
        console.log('--- [END DATABASE RESPONSE] ---\n');

        if (error) {
            console.error('[ERROR] Supabase returned an error:', error.message);
            return res.status(500).json({ message: 'Failed to fetch products', details: error.message });
        }

        console.log(`[4] Sending ${data?.length || 0} products to client.`);
        res.status(200).json(data);

    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[FATAL ERROR] An unexpected error occurred in getProducts:', message);
        res.status(500).json({ message: 'An unexpected error occurred.', details: message });
    }
    console.log('--- [END] getProducts CONTROLLER ---\n');
};


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