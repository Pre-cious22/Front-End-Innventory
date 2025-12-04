// script.js - Inventory Management System Frontend Logic

// ===================== CONFIGURATION =====================
// Update this with your actual backend API URL
const API_BASE_URL = 'http://localhost:3000/api'; // Change to your deployed backend URL

// ===================== STATE MANAGEMENT =====================
let currentSection = 'products';
let products = [];
let suppliers = [];
let orders = [];
let isEditing = false;

// ===================== DOM ELEMENTS =====================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const navLinkButtons = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const alertContainer = document.getElementById('alertContainer');

// Form elements
const form = document.getElementById('dataForm');
const recordIdInput = document.getElementById('recordId');
const recordTypeInput = document.getElementById('recordType');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitLoading = document.getElementById('submitLoading');
const cancelFormBtn = document.getElementById('cancelForm');
const resetFormBtn = document.getElementById('resetForm');

// Field containers
const productFields = document.getElementById('productFields');
const supplierFields = document.getElementById('supplierFields');
const orderFields = document.getElementById('orderFields');

// Order form specific
const supplierSelect = document.getElementById('supplierSelect');
const orderItemsList = document.getElementById('orderItemsList');
const addOrderItemBtn = document.getElementById('addOrderItem');
const orderStatus = document.getElementById('orderStatus');

// Refresh buttons
const refreshProductsBtn = document.getElementById('refreshProducts');
const refreshSuppliersBtn = document.getElementById('refreshSuppliers');
const refreshOrdersBtn = document.getElementById('refreshOrders');

// ===================== INITIALIZATION =====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Check API connection
    checkApiStatus();
    
    // Load initial data
    loadProducts();
    loadSuppliers();
    loadOrders();
    
    // Set active section
    showSection('products');
    
    // Set up mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking a link
    navLinkButtons.forEach(button => {
        button.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
    
    console.log('Initialization complete');
});

// ===================== EVENT LISTENERS =====================
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Navigation
    navLinkButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const section = button.getAttribute('data-section');
            console.log('Navigating to section:', section);
            showSection(section);
            
            // Update active state
            navLinkButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Refresh buttons
    if (refreshProductsBtn) {
        refreshProductsBtn.addEventListener('click', loadProducts);
    }
    if (refreshSuppliersBtn) {
        refreshSuppliersBtn.addEventListener('click', loadSuppliers);
    }
    if (refreshOrdersBtn) {
        refreshOrdersBtn.addEventListener('click', loadOrders);
    }
    
    // Form buttons
    if (cancelFormBtn) {
        cancelFormBtn.addEventListener('click', () => showSection('products'));
    }
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', resetForm);
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Order item management
    if (addOrderItemBtn) {
        addOrderItemBtn.addEventListener('click', addOrderItem);
    }
    
    console.log('Event listeners set up');
}

// ===================== SECTION MANAGEMENT =====================
function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.classList.add('active');
        currentSection = sectionId;
        
        // Update form based on section
        if (sectionId === 'create') {
            const activeNav = document.querySelector('.nav-link.active');
            const type = activeNav ? activeNav.getAttribute('data-section') : 'products';
            
            if (type !== 'create') {
                setupCreateForm(type);
            }
        }
    } else {
        console.error('Section not found:', sectionId);
    }
}

// ===================== FORM MANAGEMENT =====================
function setupCreateForm(type) {
    console.log('Setting up create form for:', type);
    
    // Reset form
    resetForm();
    
    // Set record type
    recordTypeInput.value = type;
    isEditing = false;
    
    // Show/hide appropriate fields
    if (productFields) productFields.style.display = type === 'products' ? 'block' : 'none';
    if (supplierFields) supplierFields.style.display = type === 'suppliers' ? 'block' : 'none';
    if (orderFields) orderFields.style.display = type === 'orders' ? 'block' : 'none';
    
    // Update form title
    const titles = {
        'products': 'Create New Product',
        'suppliers': 'Create New Supplier',
        'orders': 'Create New Order'
    };
    if (formTitle) {
        formTitle.innerHTML = `<i class="fas fa-plus-circle"></i> ${titles[type] || 'Create New Record'}`;
    }
    if (submitText) {
        submitText.textContent = titles[type] ? titles[type].replace('Create New ', 'Create ') : 'Create';
    }
    
    // Special setup for order form
    if (type === 'orders') {
        populateSupplierSelect();
        // Add one initial item
        if (orderItemsList) {
            orderItemsList.innerHTML = '';
            addOrderItem();
        }
    }
}

function setupEditForm(type, data) {
    console.log('Setting up edit form for:', type, data);
    
    showSection('create');
    isEditing = true;
    recordTypeInput.value = type;
    recordIdInput.value = data._id;
    
    // Show/hide appropriate fields
    if (productFields) productFields.style.display = type === 'product' ? 'block' : 'none';
    if (supplierFields) supplierFields.style.display = type === 'supplier' ? 'block' : 'none';
    if (orderFields) orderFields.style.display = type === 'order' ? 'block' : 'none';
    
    // Update form title
    const titles = {
        'product': 'Edit Product',
        'supplier': 'Edit Supplier',
        'order': 'Edit Order'
    };
    if (formTitle) {
        formTitle.innerHTML = `<i class="fas fa-edit"></i> ${titles[type] || 'Edit Record'}`;
    }
    if (submitText) {
        submitText.textContent = 'Update';
    }
    
    // Populate form fields based on type
    if (type === 'product') {
        document.getElementById('sku').value = data.sku || '';
        document.getElementById('name').value = data.name || '';
        document.getElementById('price').value = data.price || '';
        document.getElementById('stock').value = data.stock || '';
    } else if (type === 'supplier') {
        document.getElementById('supplierName').value = data.name || '';
        document.getElementById('contact').value = data.contact || '';
    } else if (type === 'order') {
        if (data.supplierId) {
            populateSupplierSelect(data.supplierId._id || data.supplierId);
        }
        if (orderStatus) {
            orderStatus.value = data.status || 'pending';
        }
        
        // Populate order items
        if (orderItemsList) {
            orderItemsList.innerHTML = '';
            if (data.items && data.items.length > 0) {
                data.items.forEach((item, index) => {
                    addOrderItem(item);
                });
            } else {
                addOrderItem();
            }
        }
    }
}

function resetForm() {
    console.log('Resetting form');
    
    if (form) form.reset();
    if (recordIdInput) recordIdInput.value = '';
    isEditing = false;
    
    // Clear order items except the first one
    if (recordTypeInput && recordTypeInput.value === 'order' && orderItemsList) {
        orderItemsList.innerHTML = '';
        addOrderItem();
    }
}

function addOrderItem(itemData = {}) {
    console.log('Adding order item:', itemData);
    
    if (!orderItemsList) return;
    
    const itemId = Date.now() + Math.random();
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-row';
    itemDiv.innerHTML = `
        <div style="flex: 1;">
            <label>Product</label>
            <select class="form-control product-select" data-item="${itemId}" required>
                <option value="">Select product</option>
                ${products.map(p => `<option value="${p._id}" ${itemData.productId?._id === p._id || itemData.productId === p._id ? 'selected' : ''}>${p.name} (${p.sku})</option>`).join('')}
            </select>
        </div>
        <div style="width: 120px;">
            <label>Quantity</label>
            <input type="number" class="form-control qty-input" data-item="${itemId}" min="1" value="${itemData.qty || 1}" required>
        </div>
        <div style="width: 120px;">
            <label>Price</label>
            <input type="number" class="form-control price-input" data-item="${itemId}" step="0.01" min="0" value="${itemData.price || ''}" placeholder="Auto">
        </div>
        <div style="align-self: flex-end;">
            <button type="button" class="btn-remove-item" data-item="${itemId}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    orderItemsList.appendChild(itemDiv);
    
    // Add event listener to remove button
    const removeBtn = itemDiv.querySelector('.btn-remove-item');
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            if (orderItemsList.children.length > 1) {
                itemDiv.remove();
            } else {
                showAlert('Order must have at least one item', 'error');
            }
        });
    }
    
    // Add event listener to product select to auto-fill price
    const productSelect = itemDiv.querySelector('.product-select');
    if (productSelect) {
        productSelect.addEventListener('change', function() {
            const productId = this.value;
            const product = products.find(p => p._id === productId);
            const priceInput = itemDiv.querySelector('.price-input');
            if (product && priceInput) {
                priceInput.value = product.price;
            }
        });
    }
}

function populateSupplierSelect(selectedId = '') {
    console.log('Populating supplier select, selected:', selectedId);
    
    if (!supplierSelect) return;
    
    supplierSelect.innerHTML = '<option value="">Select a supplier</option>';
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier._id;
        option.textContent = supplier.name;
        if (supplier._id === selectedId) {
            option.selected = true;
        }
        supplierSelect.appendChild(option);
    });
}

// ===================== API INTERACTIONS =====================
async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Form submitted');
    
    const type = recordTypeInput ? recordTypeInput.value : 'product';
    const id = recordIdInput ? recordIdInput.value : '';
    const isUpdate = isEditing && id;
    
    // Show loading state
    if (submitText) submitText.style.display = 'none';
    if (submitLoading) submitLoading.style.display = 'inline-block';
    
    try {
        let data = {};
        let url = '';
        let method = '';
        
        if (type === 'product') {
            data = {
                sku: document.getElementById('sku')?.value || '',
                name: document.getElementById('name')?.value || '',
                price: parseFloat(document.getElementById('price')?.value || 0),
                stock: parseInt(document.getElementById('stock')?.value || 0)
            };
            
            url = `${API_BASE_URL}/products${isUpdate ? `/${id}` : ''}`;
            method = isUpdate ? 'PUT' : 'POST';
        } else if (type === 'supplier') {
            data = {
                name: document.getElementById('supplierName')?.value || '',
                contact: document.getElementById('contact')?.value || ''
            };
            
            url = `${API_BASE_URL}/suppliers${isUpdate ? `/${id}` : ''}`;
            method = isUpdate ? 'PUT' : 'POST';
        } else if (type === 'order') {
            // Collect order items
            const items = [];
            const itemRows = orderItemsList ? orderItemsList.querySelectorAll('.item-row') : [];
            
            itemRows.forEach(row => {
                const productSelect = row.querySelector('.product-select');
                const qtyInput = row.querySelector('.qty-input');
                const priceInput = row.querySelector('.price-input');
                
                if (productSelect && qtyInput) {
                    const productId = productSelect.value;
                    const qty = parseInt(qtyInput.value || 0);
                    const price = parseFloat(priceInput?.value || 0);
                    
                    if (productId && qty) {
                        items.push({
                            productId,
                            qty,
                            price: price || undefined
                        });
                    }
                }
            });
            
            if (items.length === 0) {
                throw new Error('Order must have at least one item');
            }
            
            data = {
                items,
                supplierId: supplierSelect ? supplierSelect.value : '',
                status: orderStatus ? orderStatus.value : 'pending'
            };
            
            url = `${API_BASE_URL}/orders${isUpdate ? `/${id}` : ''}`;
            method = isUpdate ? 'PUT' : 'POST';
        }
        
        console.log('Sending request to:', url, 'method:', method, 'data:', data);
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            let errorMessage = 'Something went wrong';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // If response is not JSON, use status text
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        console.log('Success:', result);
        
        // Show success message
        showAlert(
            `${type.charAt(0).toUpperCase() + type.slice(1)} ${isUpdate ? 'updated' : 'created'} successfully!`,
            'success'
        );
        
        // Reset form and go back to list
        resetForm();
        
        // Navigate back to appropriate list
        if (type === 'order') {
            showSection('orders');
        } else if (type === 'supplier') {
            showSection('suppliers');
        } else {
            showSection('products');
        }
        
        // Refresh data
        if (type === 'product') {
            await loadProducts();
        } else if (type === 'supplier') {
            await loadSuppliers();
            // Also reload orders if supplier changed
            await loadOrders();
        } else if (type === 'order') {
            await loadOrders();
            // Products might have been updated if order was received
            await loadProducts();
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showAlert(error.message, 'error');
    } finally {
        // Hide loading state
        if (submitText) submitText.style.display = 'inline';
        if (submitLoading) submitLoading.style.display = 'none';
    }
}

async function deleteRecord(type, id) {
    console.log('Deleting record:', type, id);
    
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
        return;
    }
    
    try {
        const url = `${API_BASE_URL}/${type}s/${id}`;
        console.log('Delete URL:', url);
        
        const response = await fetch(url, {
            method: 'DELETE'
        });
        
        console.log('Delete response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to delete ${type}`);
        }
        
        showAlert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`, 'success');
        
        // Refresh data
        if (type === 'product') {
            await loadProducts();
        } else if (type === 'supplier') {
            await loadSuppliers();
        } else if (type === 'order') {
            await loadOrders();
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        showAlert(error.message || 'Failed to delete record', 'error');
    }
}

// ===================== DATA LOADING =====================
async function loadProducts() {
    console.log('Loading products...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        console.log('Products response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to load products: ${response.status} ${response.statusText}`);
        }
        
        products = await response.json();
        console.log('Loaded products:', products.length);
        
        renderProductsTable();
    } catch (error) {
        console.error('Load products error:', error);
        showAlert('Failed to load products. Make sure backend is running.', 'error');
        
        // Update table to show empty state
        const tbody = document.getElementById('productsTableBody');
        const emptyState = document.getElementById('productsEmpty');
        if (tbody) tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
    }
}

async function loadSuppliers() {
    console.log('Loading suppliers...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers`);
        console.log('Suppliers response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to load suppliers: ${response.status} ${response.statusText}`);
        }
        
        suppliers = await response.json();
        console.log('Loaded suppliers:', suppliers.length);
        
        renderSuppliersTable();
    } catch (error) {
        console.error('Load suppliers error:', error);
        showAlert('Failed to load suppliers. Make sure backend is running.', 'error');
        
        // Update table to show empty state
        const tbody = document.getElementById('suppliersTableBody');
        const emptyState = document.getElementById('suppliersEmpty');
        if (tbody) tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
    }
}

async function loadOrders() {
    console.log('Loading orders...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        console.log('Orders response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to load orders: ${response.status} ${response.statusText}`);
        }
        
        orders = await response.json();
        console.log('Loaded orders:', orders.length);
        
        renderOrdersTable();
    } catch (error) {
        console.error('Load orders error:', error);
        showAlert('Failed to load orders. Make sure backend is running.', 'error');
        
        // Update table to show empty state
        const tbody = document.getElementById('ordersTableBody');
        const emptyState = document.getElementById('ordersEmpty');
        if (tbody) tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
    }
}

// ===================== TABLE RENDERING =====================
function renderProductsTable() {
    console.log('Rendering products table');
    
    const tbody = document.getElementById('productsTableBody');
    const emptyState = document.getElementById('productsEmpty');
    
    if (!tbody || !emptyState) {
        console.error('Products table elements not found');
        return;
    }
    
    if (products.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Create safe HTML string
    const rows = products.map(product => {
        const stockClass = product.stock < 20 ? 'badge badge-warning' : 'badge badge-success';
        const safeProduct = {
            _id: product._id || '',
            sku: product.sku || '',
            name: product.name || '',
            price: product.price || 0,
            stock: product.stock || 0
        };
        
        return `
            <tr>
                <td><strong>${escapeHtml(safeProduct.sku)}</strong></td>
                <td>${escapeHtml(safeProduct.name)}</td>
                <td>$${safeProduct.price.toFixed(2)}</td>
                <td>
                    <span class="${stockClass}">
                        ${safeProduct.stock} units
                    </span>
                </td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-warning" onclick="window.setupEditForm('product', ${JSON.stringify(safeProduct)})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.deleteRecord('product', '${safeProduct._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = rows;
}

function renderSuppliersTable() {
    console.log('Rendering suppliers table');
    
    const tbody = document.getElementById('suppliersTableBody');
    const emptyState = document.getElementById('suppliersEmpty');
    
    if (!tbody || !emptyState) {
        console.error('Suppliers table elements not found');
        return;
    }
    
    if (suppliers.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    const rows = suppliers.map(supplier => {
        const safeSupplier = {
            _id: supplier._id || '',
            name: supplier.name || '',
            contact: supplier.contact || '',
            createdAt: supplier.createdAt || new Date().toISOString()
        };
        
        return `
            <tr>
                <td><strong>${escapeHtml(safeSupplier.name)}</strong></td>
                <td>${escapeHtml(safeSupplier.contact) || '—'}</td>
                <td>${new Date(safeSupplier.createdAt).toLocaleDateString()}</td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-warning" onclick="window.setupEditForm('supplier', ${JSON.stringify(safeSupplier)})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.deleteRecord('supplier', '${safeSupplier._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = rows;
}

function renderOrdersTable() {
    console.log('Rendering orders table');
    
    const tbody = document.getElementById('ordersTableBody');
    const emptyState = document.getElementById('ordersEmpty');
    
    if (!tbody || !emptyState) {
        console.error('Orders table elements not found');
        return;
    }
    
    if (orders.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    const rows = orders.map(order => {
        // Determine status badge
        let statusBadge = '';
        if (order.status === 'pending') {
            statusBadge = '<span class="badge badge-pending">Pending</span>';
        } else if (order.status === 'received') {
            statusBadge = '<span class="badge badge-received">Received</span>';
        } else if (order.status === 'cancelled') {
            statusBadge = '<span class="badge badge-cancelled">Cancelled</span>';
        } else {
            statusBadge = `<span class="badge">${order.status || 'Unknown'}</span>`;
        }
        
        // Count total items
        const itemCount = order.items ? order.items.length : 0;
        
        const safeOrder = {
            _id: order._id || '',
            supplierId: order.supplierId || { _id: '', name: 'Unknown Supplier' },
            items: order.items || [],
            status: order.status || 'pending',
            orderedAt: order.orderedAt || new Date().toISOString()
        };
        
        return `
            <tr>
                <td>${safeOrder._id.substring(Math.max(0, safeOrder._id.length - 8))}</td>
                <td>${escapeHtml(safeOrder.supplierId.name || 'Unknown Supplier')}</td>
                <td>${itemCount} item${itemCount !== 1 ? 's' : ''}</td>
                <td>${statusBadge}</td>
                <td>${new Date(safeOrder.orderedAt).toLocaleDateString()}</td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-warning" onclick="window.setupEditForm('order', ${JSON.stringify(safeOrder)})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.deleteRecord('order', '${safeOrder._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = rows;
}

// ===================== UTILITY FUNCTIONS =====================
function showAlert(message, type = 'success') {
    console.log(`Showing alert: ${type} - ${message}`);
    
    if (!alertContainer) {
        console.error('Alert container not found');
        return;
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <span>${escapeHtml(message)}</span>
        <button class="close-alert">&times;</button>
    `;
    
    alertContainer.appendChild(alertDiv);
    
    // Add event listener to close button
    const closeBtn = alertDiv.querySelector('.close-alert');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            alertDiv.remove();
        });
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

async function checkApiStatus() {
    console.log('Checking API status...');
    
    const statusElement = document.getElementById('apiStatus');
    if (!statusElement) {
        console.error('API status element not found');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (response.ok) {
            statusElement.textContent = 'Connected ✓';
            statusElement.className = 'api-status connected';
            console.log('API connection successful');
        } else {
            statusElement.textContent = 'Disconnected ✗';
            statusElement.className = 'api-status disconnected';
            console.error('API responded with error:', response.status);
        }
    } catch (error) {
        console.error('API connection failed:', error);
        statusElement.textContent = 'Disconnected ✗';
        statusElement.className = 'api-status disconnected';
        showAlert(`Cannot connect to backend API at ${API_BASE_URL}. Make sure the server is running.`, 'error');
    }
}

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================== GLOBAL EXPORTS =====================
// Make functions available globally for inline event handlers
window.setupEditForm = setupEditForm;
window.deleteRecord = deleteRecord;
window.showSection = showSection;
window.loadProducts = loadProducts;
window.loadSuppliers = loadSuppliers;
window.loadOrders = loadOrders;

console.log('Script loaded successfully');