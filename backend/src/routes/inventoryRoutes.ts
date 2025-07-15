import express from 'express';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductQuantity
} from '../controllers/inventoryController';
import { dualAuthenticateToken } from '../middleware/dualAuthMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes in this file
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