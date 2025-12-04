// server.js - Backend API for Inventory Management System
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (for demo purposes)
let products = [
    { 
        _id: '1', 
        sku: 'P001', 
        name: 'Laptop', 
        price: 999.99, 
        stock: 15,
        createdAt: new Date().toISOString()
    },
    { 
        _id: '2', 
        sku: 'P002', 
        name: 'Wireless Mouse', 
        price: 29.99, 
        stock: 50,
        createdAt: new Date().toISOString()
    }
];

let suppliers = [
    { 
        _id: '1', 
        name: 'Tech Supplier Inc.', 
        contact: 'contact@techsupplier.com',
        createdAt: new Date().toISOString()
    },
    { 
        _id: '2', 
        name: 'Office Supplies Co.', 
        contact: 'sales@officesupplies.com',
        createdAt: new Date().toISOString()
    }
];

let orders = [
    { 
        _id: 'ORD001', 
        supplierId: { _id: '1', name: 'Tech Supplier Inc.' }, 
        items: [
            { productId: '1', product: { _id: '1', name: 'Laptop', price: 999.99 }, qty: 5, price: 999.99 },
            { productId: '2', product: { _id: '2', name: 'Wireless Mouse', price: 29.99 }, qty: 10, price: 29.99 }
        ], 
        status: 'pending',
        orderedAt: new Date().toISOString()
    }
];

// ===================== PRODUCTS API =====================
// Get all products
app.get('/api/products', (req, res) => {
    console.log('GET /api/products');
    res.json(products);
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p._id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
});

// Create product
app.post('/api/products', (req, res) => {
    const product = {
        _id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    products.push(product);
    res.status(201).json(product);
});

// Update product
app.put('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p._id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p._id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    products.splice(index, 1);
    res.status(204).send();
});

// ===================== SUPPLIERS API =====================
// Get all suppliers
app.get('/api/suppliers', (req, res) => {
    console.log('GET /api/suppliers');
    res.json(suppliers);
});

// Get single supplier
app.get('/api/suppliers/:id', (req, res) => {
    const supplier = suppliers.find(s => s._id === req.params.id);
    if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
});

// Create supplier
app.post('/api/suppliers', (req, res) => {
    const supplier = {
        _id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    suppliers.push(supplier);
    res.status(201).json(supplier);
});

// Update supplier
app.put('/api/suppliers/:id', (req, res) => {
    const index = suppliers.findIndex(s => s._id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Supplier not found' });
    }
    
    suppliers[index] = { ...suppliers[index], ...req.body };
    res.json(suppliers[index]);
});

// Delete supplier
app.delete('/api/suppliers/:id', (req, res) => {
    const index = suppliers.findIndex(s => s._id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Supplier not found' });
    }
    
    suppliers.splice(index, 1);
    res.status(204).send();
});

// ===================== ORDERS API =====================
// Get all orders
app.get('/api/orders', (req, res) => {
    console.log('GET /api/orders');
    res.json(orders);
});

// Get single order
app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o._id === req.params.id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
});

// Create order
app.post('/api/orders', (req, res) => {
    const supplier = suppliers.find(s => s._id === req.body.supplierId);
    if (!supplier) {
        return res.status(400).json({ error: 'Supplier not found' });
    }
    
    // Add product details to items
    const itemsWithDetails = req.body.items.map(item => {
        const product = products.find(p => p._id === item.productId);
        return {
            ...item,
            product: product || { _id: item.productId, name: 'Unknown Product', price: 0 }
        };
    });
    
    const order = {
        _id: 'ORD' + Date.now().toString().slice(-6),
        items: itemsWithDetails,
        supplierId: supplier,
        status: req.body.status || 'pending',
        orderedAt: new Date().toISOString()
    };
    
    orders.push(order);
    res.status(201).json(order);
});

// Update order
app.put('/api/orders/:id', (req, res) => {
    const index = orders.findIndex(o => o._id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    let updatedOrder = { ...orders[index], ...req.body };
    
    // If supplierId is being updated, get supplier details
    if (req.body.supplierId) {
        const supplier = suppliers.find(s => s._id === req.body.supplierId);
        if (!supplier) {
            return res.status(400).json({ error: 'Supplier not found' });
        }
        updatedOrder.supplierId = supplier;
    }
    
    // If items are being updated, add product details
    if (req.body.items) {
        updatedOrder.items = req.body.items.map(item => {
            const product = products.find(p => p._id === item.productId);
            return {
                ...item,
                product: product || { _id: item.productId, name: 'Unknown Product', price: 0 }
            };
        });
    }
    
    orders[index] = updatedOrder;
    res.json(orders[index]);
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
    const index = orders.findIndex(o => o._id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    orders.splice(index, 1);
    res.status(204).send();
});

// ===================== HEALTH CHECK =====================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        counts: {
            products: products.length,
            suppliers: suppliers.length,
            orders: orders.length
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Backend server running at http://localhost:${PORT}`);
    console.log(`📦 Products: http://localhost:${PORT}/api/products`);
    console.log(`🚚 Suppliers: http://localhost:${PORT}/api/suppliers`);
    console.log(`📋 Orders: http://localhost:${PORT}/api/orders`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('\n📝 Sample Data Loaded:');
    console.log(`   - ${products.length} products`);
    console.log(`   - ${suppliers.length} suppliers`);
    console.log(`   - ${orders.length} orders`);
});