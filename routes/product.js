const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const xml2js = require('xml2js');
const fs = require('fs');

// Función para agregar un producto al archivo XML
const addProductToXML = async (product) => {
  try {
    // Leer el archivo XML existente
    const xmlData = fs.readFileSync('public/xml/productos.xml', 'utf-8');
    // Convertir el XML a objeto JavaScript
    const parser = new xml2js.Parser();
    const xmlObject = await parser.parseStringPromise(xmlData);

    // Agregar el nuevo producto al objeto JavaScript
    xmlObject.productos.producto.push({
      nombre: product.name,
      precio: product.price,
      categoria: product.category,
      stock: product.stock
    });

    // Convertir el objeto JavaScript actualizado de nuevo a XML
    const builder = new xml2js.Builder();
    const updatedXml = builder.buildObject(xmlObject);

    // Escribir el XML actualizado de vuelta al archivo
    fs.writeFileSync('public/xml/productos.xml', updatedXml);
  } catch (error) {
    console.error('Error al agregar el producto al archivo XML:', error);
  }
};

// Función para eliminar un producto del archivo XML
const removeProductFromXML = async (productId) => {
  try {
    // Leer el archivo XML existente
    const xmlData = fs.readFileSync('public/xml/productos.xml', 'utf-8');
    // Convertir el XML a objeto JavaScript
    const parser = new xml2js.Parser();
    const xmlObject = await parser.parseStringPromise(xmlData);

    // Encontrar el índice del producto en el objeto JavaScript
    const index = xmlObject.productos.producto.findIndex(product => product.id === productId);
    // Eliminar el producto del objeto JavaScript
    xmlObject.productos.producto.splice(index, 1);

    // Convertir el objeto JavaScript actualizado de nuevo a XML
    const builder = new xml2js.Builder();
    const updatedXml = builder.buildObject(xmlObject);

    // Escribir el XML actualizado de vuelta al archivo
    fs.writeFileSync('public/xml/productos.xml', updatedXml);
  } catch (error) {
    console.error('Error al eliminar el producto del archivo XML:', error);
  }
};

// Ruta para listar todos los productos
router.get('/list', async (req, res) => {
  try {
    const products = await Product.find();
    // Leer el archivo XML existente
    const xmlData = fs.readFileSync('public/xml/productos.xml', 'utf-8');
    // Convertir el XML a objeto JavaScript
    const parser = new xml2js.Parser();
    const xmlObject = await parser.parseStringPromise(xmlData);

    // Combina los productos de la base de datos y del archivo XML
    const allProducts = products.concat(xmlObject.productos.producto);
    
    res.render('list', { products: allProducts });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).send('Error al obtener los productos');
  }
});

router.get('/create', (req, res) => {
    res.render('create'); // Asumiendo que tienes un archivo de vista llamado 'create.ejs'
  });

// Ruta para crear un nuevo producto
router.post('/', async (req, res) => {
  const product = new Product(req.body);
  try {
    // Guardar el nuevo producto en la base de datos
    await product.save();
    // Agregar el nuevo producto al archivo XML
    await addProductToXML(product);
    res.redirect('/products/list');
  } catch (error) {
    console.error('Error al crear un nuevo producto:', error);
    res.status(500).send('Error al crear un nuevo producto');
  }
});

// Ruta para eliminar un producto
router.delete('/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    // Eliminar el producto de la base de datos
    await Product.findByIdAndDelete(productId);
    // Eliminar el producto del archivo XML
    await removeProductFromXML(productId);
    res.redirect('/products/list');
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).send('Error al eliminar el producto');
  }
});

// Otras rutas CRUD...

module.exports = router;
