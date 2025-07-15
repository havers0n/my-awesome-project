import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../supabaseAdminClient';
import { z } from 'zod';
import { logAdminAction } from '../utils/logger';

// Wrapper for async route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Zod schema for organization data validation
const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters long'),
  owner_id: z.string().uuid().optional(),
  industry: z.string().optional(),
  status: z.enum(['active', 'inactive', 'trial']).default('active'),
});

// GET /organizations - Get all organizations
export const getOrganizations = asyncHandler(async (req, res, next) => {
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
});

// POST /organizations - Create a new organization
export const createOrganization = asyncHandler(async (req, res, next) => {
    const orgData = organizationSchema.parse(req.body);
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .insert([orgData])
      .select()
      .single();

    if (error) throw error;

    logAdminAction('create_organization_success', { adminId: req.user?.id, orgId: data.id, orgName: data.name });
    res.status(201).json(data);
});

// PUT /organizations/:id - Update an organization
export const updateOrganization = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const orgData = organizationSchema.parse(req.body);
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .update(orgData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Organization not found.' });
    
    logAdminAction('update_organization_success', { adminId: req.user?.id, orgId: data.id });
    res.json(data);
});

// DELETE /organizations/:id - Delete an organization
export const deleteOrganization = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin
    .from('organizations')
    .delete()
    .eq('id', id);

  if (error) throw error;

  logAdminAction('delete_organization_success', { adminId: req.user?.id, orgId: id });
  res.status(204).send();
});

// Error handling middleware to be added in app.ts
export const handleZodError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'Invalid data', details: err.errors });
  }
  next(err);
};

export const handleSupabaseError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code && typeof err.code === 'string') { // Basic check for Supabase/PostgREST error
        logAdminAction('supabase_error', { adminId: req.user?.id, code: err.code, message: err.message, path: req.path });
        return res.status(500).json({ error: 'Database operation failed', details: err.message });
    }
    next(err);
}; 