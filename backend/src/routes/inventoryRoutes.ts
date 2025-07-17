import * as express from 'express';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductQuantity
} from '../controllers/inventoryController';
import { dualAuthenticateToken } from '../middleware/dualAuthMiddleware';

const router = express.Router();

// Test routes for debugging
router.get('/hello', (req, res) => {
    console.log('!!!!!!!!!! HELLO ROUTE WAS CALLED !!!!!!!!!!');
    res.status(200).json({ message: 'Hello from inventory routes!' });
});

router.get('/test-no-auth', (req, res) => {
    console.log('=== Inventory test route called (no auth) ===');
    res.json({
        success: true,
        message: 'This test route works without authentication',
        timestamp: new Date().toISOString()
    });
});

// Apply authentication middleware to all subsequent routes
router.use(dualAuthenticateToken);

// Define routes using router.route() for cleaner structure
router.route('/products')
    .get(getProducts)
    .post(createProduct);

router.route('/products/:id')
    .put(updateProduct)
    .delete(deleteProduct);

router.put('/products/:id/quantity', updateProductQuantity);

export default router;