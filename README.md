# 🌐 Base URL

# 📦 Products API
''' Method	Endpoint	Description	Request Body	Response
GET	/api/products	Get all products	-	Array of product objects
GET	/api/products/:id	Get single product by ID	-	Single product object
POST	/api/products	Create new product	{ sku, name, price, stock }	Created product object
PUT	/api/products/:id	Update product by ID	{ sku?, name?, price?, stock? }	Updated product object
DELETE	/api/products/:id	Delete product by ID	-	204 No Content''' 
