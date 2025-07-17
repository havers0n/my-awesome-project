import * as express from 'express';
import {
    getOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization
} from '../controllers/organizationController';
import { authenticate } from '../middleware/authenticate';
import { checkAdminPermission } from '../middleware/permissionMiddleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getOrganizations);

// Protected routes (authentication required)
router.use(authenticate);

router.route('/')
    .post(createOrganization);

router.route('/:organizationId')
    .put(updateOrganization)
    .delete(deleteOrganization);

export default router;