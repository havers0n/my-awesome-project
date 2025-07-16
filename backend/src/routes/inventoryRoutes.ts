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

// Test route without authentication for debugging
router.get('/test-no-auth', (req, res) => {
    console.log('=== Inventory test route called (no auth) ===');
    res.json({ 
        success: true, 
        message: 'This test route works without authentication',
        timestamp: new Date().toISOString()
    });
});

// Apply authentication middleware to all other routes in this file
router.use(dualAuthenticateToken);

// Route to get all products and create a new product
router.route('/products')
    .get(getProducts)
    .post(createProduct);

// Route to update a specific product's quantity
router.put('/products/:id/quantity', updateProductQuantity);

// Route for operations on a single product (update, delete)
router.route('/products/:id')
    .put(updateProduct)
    .delete(deleteProduct);

export default router; 