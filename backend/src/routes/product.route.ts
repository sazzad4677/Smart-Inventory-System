import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { createProduct, getProducts, updateProduct } from '../controllers/product.controller';

const router = Router();

router.get('/', getProducts);

router.post('/', validateRequest(createProductSchema), createProduct);

router.put('/:id', validateRequest(updateProductSchema), updateProduct);

router.patch('/:id', validateRequest(updateProductSchema), updateProduct);

export default router;
