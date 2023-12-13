
const express = require('express');
const ProductManager = require('./ProductManager'); 

const app = express();
const productManager = new ProductManager(); 
app.get('/products', (req, res) => {
  const { limit } = req.query;
  let products = productManager.getAllProducts();

  if (limit) {
    const parsedLimit = parseInt(limit);
    products = products.slice(0, parsedLimit);
  }

  res.json(products);
});

app.get('/products/:pid', (req, res) => {
  const productId = req.params.pid;
  const product = productManager.getProductById(productId);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
