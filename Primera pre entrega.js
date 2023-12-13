const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const productsRouter = express.Router();
const productsFilePath = 'productos.json';

productsRouter.get('/', (req, res) => {
    const products = getProductsFromFile();
    res.json(products);
});

productsRouter.get('/:pid', (req, res) => {
    const products = getProductsFromFile();
    const product = products.find(p => p.id === req.params.pid);
    res.json(product);
});

productsRouter.post('/', (req, res) => {
    const newProduct = {
        id: uuidv4(), 
        title: req.body.title,
        description: req.body.description,
        code: req.body.code,
        price: req.body.price,
        status: true,
        stock: req.body.stock,
        category: req.body.category,
        thumbnails: req.body.thumbnails || []
    };

    const products = getProductsFromFile();
    products.push(newProduct);
    saveProductsToFile(products);

    res.json(newProduct);
});

productsRouter.put('/:pid', (req, res) => {
    const updatedFields = req.body;
    const products = getProductsFromFile();
    const index = products.findIndex(p => p.id === req.params.pid);

    if (index !== -1) {
        products[index] = { ...products[index], ...updatedFields };
        saveProductsToFile(products);
        res.json(products[index]);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

productsRouter.delete('/:pid', (req, res) => {
    const products = getProductsFromFile();
    const filteredProducts = products.filter(p => p.id !== req.params.pid);
    saveProductsToFile(filteredProducts);
    res.send('Producto eliminado correctamente');
});

const cartsRouter = express.Router();
const cartFilePath = 'carrito.json';

cartsRouter.post('/', (req, res) => {
    const newCart = {
        id: uuidv4(),
        products: []
    };

    saveCartToFile(newCart);
    res.json(newCart);
});

cartsRouter.get('/:cid', (req, res) => {
    const cart = getCartFromFile();
    const cartId = req.params.cid;
    const cartProducts = cart.products.filter(product => product.cartId === cartId);
    res.json(cartProducts);
});

cartsRouter.post('/:cid/product/:pid', (req, res) => {
    const cart = getCartFromFile();
    const { cid, pid } = req.params;
    const quantity = req.body.quantity || 1;

    const existingProduct = cart.products.find(prod => prod.productId === pid && prod.cartId === cid);
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart.products.push({ cartId: cid, productId: pid, quantity });
    }

    saveCartToFile(cart);
    res.send('Producto agregado al carrito correctamente');
});

function getProductsFromFile() {
    try {
        const productsData = fs.readFileSync(productsFilePath, 'utf8');
        return JSON.parse(productsData);
    } catch (error) {
        return [];
    }
}

function saveProductsToFile(products) {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
}

function getCartFromFile() {
    try {
        const cartData = fs.readFileSync(cartFilePath, 'utf8');
        return JSON.parse(cartData);
    } catch (error) {
        return { id: '', products: [] };
    }
}

function saveCartToFile(cart) {
    fs.writeFileSync(cartFilePath, JSON.stringify(cart, null, 2));
}

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
