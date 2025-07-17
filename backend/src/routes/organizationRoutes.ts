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

// Apply authentication middleware to all routes
router.use(authenticate);

// Organization routes
router.route('/')
    .get(getOrganizations)
    .post(createOrganization);

router.route('/:organizationId')
    .put(updateOrganization)
    .delete(deleteOrganization);

export default router;