import * as express from 'express';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductQuantity
} from '../controllers/inventoryController';
import { authenticate } from '../middleware/authenticate';
import { requireOrganization } from '../middleware/requireOrganization';

const router = express.Router();

// Test routes (no auth)
router.get('/hello', (req, res) => {
    res.status(200).json({ message: 'Hello from inventory routes!' });
});

router.get('/test-no-auth', (req, res) => {
    res.json({
        success: true,
        message: 'This test route works without authentication',
        timestamp: new Date().toISOString()
    });
});

// Protected routes
// All routes below are protected and require a valid user session
router.use(authenticate);

// All routes below also require the user to be part of an organization
// router.use(requireOrganization);

router.route('/products')
    .get(getProducts)
    .post(createProduct);

router.route('/products/:id')
    .put(updateProduct)
    .delete(deleteProduct);

router.put('/products/:id/quantity', updateProductQuantity);

export default router;