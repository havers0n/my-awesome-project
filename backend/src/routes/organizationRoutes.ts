import express from 'express';
import {
    getOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization
} from '../controllers/organizationController';
import { authenticateSupabaseToken } from '../middleware/supabaseAuthMiddleware';
import { checkAdminPermission } from '../middleware/permissionMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateSupabaseToken);

// Apply admin permission check to all routes. 
// This ensures only users with 'admin' role can manage organizations.
router.use(checkAdminPermission); 

router.route('/')
    .get(getOrganizations)
    .post(createOrganization);

router.route('/:id')
    .put(updateOrganization)
    .delete(deleteOrganization);

export default router; 