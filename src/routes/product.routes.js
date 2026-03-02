const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Ruta para el CRUD de la Fase 4
router.delete('/:id', productController.deleteProduct);


// Endpoints de Business Intelligence (Fase 5)
router.get('/analysis/suppliers', productController.getSuppliersAnalysis);
router.get('/history/customer/:email', productController.getCustomerHistory);
router.get('/top-selling/:category', productController.getTopProductsByCategory);


module.exports = router;
