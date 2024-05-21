const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const xml2js = require('xml2js');
const fs = require('fs');

// Función para agregar un producto al archivo XML si no existe
const addProductToXMLIfNotExists = async (product) => {
  try {
    const xmlData = fs.readFileSync('public/xml/productos.xml', 'utf-8');
    const parser = new xml2js.Parser();
    const xmlObject = await parser.parseStringPromise(xmlData);

    if (xmlObject && xmlObject.productos && xmlObject.productos.producto) {
      const existingProduct = xmlObject.productos.producto.find(p => p.$.id === product._id.toString());
      if (!existingProduct) {
        xmlObject.productos.producto.push({
          $: { id: product._id.toString() },
          name: product.name,
          price: product.price,
          category: product.category,
          stock: product.stock
        });

        const builder = new xml2js.Builder();
        const updatedXml = builder.buildObject(xmlObject);
        fs.writeFileSync('public/xml/productos.xml', updatedXml);
        return { success: true, message: 'Producto agregado al XML correctamente.' };
      } else {
        console.log(`El producto con ID ${product._id} ya existe en el XML`);
        return { success: false, message: `El producto con ID ${product._id} ya existe en el XML.` };
      }
    } else {
      console.log('La estructura del XML no es la esperada');
      return { success: false, message: 'La estructura del XML no es la esperada.' };
    }
  } catch (error) {
    console.error('Error al agregar el producto al archivo XML:', error);
    return { success: false, message: 'Error al agregar el producto al archivo XML.' };
  }
};

// Función para eliminar un producto del archivo XML
const removeProductFromXML = async (productId) => {
  try {
    const xmlData = fs.readFileSync('public/xml/productos.xml', 'utf-8');
    const parser = new xml2js.Parser();
    const xmlObject = await parser.parseStringPromise(xmlData);

    if (xmlObject && xmlObject.productos && xmlObject.productos.producto) {
      const index = xmlObject.productos.producto.findIndex(product => product.$.id === productId);
      if (index > -1) {
        xmlObject.productos.producto.splice(index, 1);

        const builder = new xml2js.Builder();
        const updatedXml = builder.buildObject(xmlObject);
        fs.writeFileSync('public/xml/productos.xml', updatedXml);

        if (xmlObject.productos.producto.length === 0) {
          const emptyXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><productos></productos>';
          fs.writeFileSync('public/xml/productos.xml', emptyXml);
        }
      } else {
        console.log(`Producto con ID ${productId} no encontrado en el XML`);
      }
    } else {
      console.log('El XML no tiene la estructura esperada');
    }
  } catch (error) {
    console.error('Error al eliminar el producto del archivo XML:', error);
  }
};

// Ruta para listar todos los productos
router.get('/list', async (req, res) => {
  try {
    const products = await Product.find();
    const xmlData = fs.readFileSync('public/xml/productos.xml', 'utf-8');
    const parser = new xml2js.Parser();
    const xmlObject = await parser.parseStringPromise(xmlData);

    // Crear un mapa para rastrear los productos únicos por ID
    const productMap = new Map();

    // Agregar productos de la base de datos al mapa
    products.forEach(product => {
      productMap.set(product._id.toString(), product);
    });

    // Agregar productos del XML al mapa (solo si no están ya en el mapa)
    if (xmlObject.productos && xmlObject.productos.producto) {
      xmlObject.productos.producto.forEach(product => {
        if (!productMap.has(product.$.id)) {
          productMap.set(product.$.id, {
            _id: product.$.id,
            name: product.name[0],
            price: product.price[0],
            category: product.category[0],
            stock: product.stock[0]
          });
        }
      });
    }

    // Convertir el mapa de productos a una lista
    const allProducts = Array.from(productMap.values());

    res.render('list', { products: allProducts });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).send('Error al obtener los productos');
  }
});

// Ruta para mostrar el formulario de creación de productos
router.get('/create', (req, res) => {
  res.render('create');
});

// Ruta para crear un nuevo producto
router.post('/', async (req, res) => {
  const product = new Product(req.body);
  try {
    await product.save();
    const xmlResult = await addProductToXMLIfNotExists(product);
    if (xmlResult.success) {
      res.redirect('/products/list');
    } else {
      res.status(500).send(xmlResult.message);
    }
  } catch (error) {
    console.error('Error al crear un nuevo producto:', error);
    res.status(500).send('Error al crear un nuevo producto');
  }
});

// Ruta para eliminar un producto
router.delete('/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    await Product.findByIdAndDelete(productId);
    await removeProductFromXML(productId);
    res.redirect('/products/list');
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).send('Error al eliminar el producto');
  }
});

module.exports = router;
