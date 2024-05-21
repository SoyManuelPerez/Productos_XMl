const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Crear un producto
router.post('/', async (req, res) => {
  const product = new Product(req.body);
  try {
    await product.save();
    res.redirect('/products/list');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Obtener todos los productos
router.get('/list', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('list', { products });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Obtener el formulario de edición de un producto
router.put('/:id/edit', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.render('update', { product });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/products/list');
  } catch (err) {
    res.status(500).send(err);
  }
});
// Ruta para mostrar el listado transformado
router.get('/listado', (req, res) => {
  res.sendFile('listado.html', { root: 'public' });
});

// Ruta para mostrar el formulario de creación de productos
router.get('/create', (req, res) => {
  res.render('create'); // Asumiendo que tienes un archivo de vista llamado 'create.ejs'
});

module.exports = router;
