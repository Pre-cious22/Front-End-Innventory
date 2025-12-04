# 🌐 Base URL
# Base Url Frontend: https://front-end-innventory.vercel.app/
# Base Url Backend: https://se2-midterm-project-osie.onrender.com/


## 📊 Products API

| Method | Endpoint              | Description          | Status Codes |
|--------|-----------------------|----------------------|-------------|
| GET    | /api/products         | Get all products     | 200, 500    |
| GET    | /api/products/:id     | Get single product   | 200, 404    |
| POST   | /api/products         | Create new product   | 201, 400    |
| PUT    | /api/products/:id     | Update product       | 200, 404    |
| DELETE | /api/products/:id     | Delete product       | 204, 404    |

## 🚚 Suppliers API

| Method | Endpoint               | Description               | Request Body           | Response                  |
|--------|------------------------|---------------------------|-----------------------|---------------------------|
| GET    | /api/suppliers         | Get all suppliers         | -                     | Array of supplier objects |
| GET    | /api/suppliers/:id     | Get single supplier by ID | -                     | Single supplier object    |
| POST   | /api/suppliers         | Create new supplier       | { name, contact }     | Created supplier object   |
| PUT    | /api/suppliers/:id     | Update supplier by ID     | { name?, contact? }   | Updated supplier object   |
| DELETE | /api/suppliers/:id     | Delete supplier by ID     | -                     | 204 No Content            |

## 📋 Orders API

| Method | Endpoint           | Description             | Request Body                     | Response                |
|--------|------------------|-------------------------|---------------------------------|------------------------|
| GET    | /api/orders       | Get all orders          | -                               | Array of order objects  |
| GET    | /api/orders/:id   | Get single order by ID  | -                               | Single order object     |
| POST   | /api/orders       | Create new order        | { supplierId, items[], status? } | Created order object    |
| PUT    | /api/orders/:id   | Update order by ID      | { supplierId?, items[]?, status? } | Updated order object    |
| DELETE | /api/orders/:id   | Delete order by ID      | -                               | -                       |

# 🎯 Core Features

# 📦 Product Management

✅ CRUD Operations - Create, Read, Update, Delete products
✅ Stock Tracking - Real-time inventory with low-stock alerts (<20 units)
✅ SKU & Pricing - Product identifiers and price management

# 🚚 Supplier Management

✅ Supplier Directory - Store and manage supplier contact info
✅ Supplier-Product Link - Relate suppliers to products

# 🔄 Data Management
✅ Real-time Updates - Changes reflect immediately
✅ In-memory Storage - No database needed for demo
✅ Form Validation - Prevents invalid data entry

# 🎨 User Interface
✅ Responsive Design - Works on mobile & desktop
✅ Clean Dashboard - Separate sections for Products/Suppliers/Orders
✅ Visual Feedback - Success/error alerts and loading states

# 📸 Screenshot frontend
<img width="1102" height="930" alt="Screenshot 2025-12-04 213354" src="https://github.com/user-attachments/assets/44790e13-9a96-4a1b-a5cc-6140c2c85cf0" />

<img width="1097" height="930" alt="Screenshot 2025-12-04 213454" src="https://github.com/user-attachments/assets/645d9481-f0a6-4512-9028-929826b83b1b" />

<img width="1082" height="901" alt="Screenshot 2025-12-04 213531" src="https://github.com/user-attachments/assets/6627b3d2-60ef-42ac-95b1-b83556034b1a" />

<img width="1087" height="926" alt="Screenshot 2025-12-04 213613" src="https://github.com/user-attachments/assets/47687291-cbf9-4bc0-8bbc-a8ca22ecb1fe" />
