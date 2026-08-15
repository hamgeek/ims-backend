# Inventory Management System — Backend

Backend REST API untuk **Inventory Management System (IMS)** yang digunakan untuk mengelola pengguna, kategori produk, produk, serta histori perubahan stok.

Project ini dibangun dengan arsitektur modular sederhana menggunakan **Hono**, **Prisma ORM**, **PostgreSQL**, **Better Auth**, **Zod**, dan **TypeScript**.

Frontend Repo : [https://github.com/hamgeek/ims-frontend](https://github.com/hamgeek/ims-frontend)

---

## 1. Teknologi

| Teknologi   | Fungsi                                |
| ----------- | ------------------------------------- |
| TypeScript  | Bahasa pemrograman                    |
| Hono        | Web framework dan REST API            |
| Prisma ORM  | Database ORM                          |
| PostgreSQL  | Database                              |
| Better Auth | Authentication dan session management |
| Zod         | Validasi request                      |
| Bun         | Package manager/runtime               |
| ESLint      | Code linting                          |

---

# 2. Fitur

Backend menyediakan fitur utama:

- Registrasi user
- Login user
- Session authentication
- Update profile
- CRUD kategori
- CRUD produk
- Pencatatan stock movement
- Stock IN
- Stock OUT
- Stock ADJUSTMENT
- Riwayat perubahan stok
- Pencatatan user yang melakukan perubahan stok
- Relasi User, Category, Product, dan Stock Movement
- Validasi request menggunakan Zod
- Centralized application error menggunakan `AppError`
- Database transaction untuk perubahan stok

---

# 3. Arsitektur

Project menggunakan pola:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Contract / Zod
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

### Route

Bertanggung jawab menentukan:

- HTTP method
- endpoint
- middleware
- controller

Route tidak menangani business logic.

### Middleware

Digunakan untuk concern yang bersifat cross-cutting.

Contoh:

```text
Authentication
Authorization
```

Authentication menggunakan Better Auth.

### Controller

Bertanggung jawab menangani HTTP request dan response.

Contoh:

```text
Request body
    ↓
Zod validation
    ↓
Service
    ↓
JSON response
```

### Contract

Berisi schema Zod dan type input.

Contoh:

```ts
export const createProductSchema = z.object({
  name: productNameSchema,
  sku: productSkuSchema,
  price: productPriceSchema,
});
```

Type dibuat menggunakan:

```ts
export type CreateProductInput = z.infer<typeof createProductSchema>;
```

### Service

Berisi business logic dan komunikasi dengan Prisma atau Better Auth.

Controller tidak melakukan query database secara langsung.

---

# 4. Struktur Folder

Struktur utama project:

```text
src/
├── exceptions/
│   └── app-error.ts
│
├── lib/
│   ├── auth.ts
│   └── db.ts
│
├── middlewares/
│   └── auth.middleware.ts
│
├── routes/
│   ├── index.ts
│   │
│   ├── users/
│   │   ├── users.contract.ts
│   │   ├── users.controller.ts
│   │   ├── users.route.ts
│   │   └── users.service.ts
│   │
│   ├── categories/
│   │   ├── categories.contract.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.route.ts
│   │   └── categories.service.ts
│   │
│   ├── products/
│   │   ├── products.contract.ts
│   │   ├── products.controller.ts
│   │   ├── products.route.ts
│   │   └── products.service.ts
│   │
│   └── stock-movements/
│       ├── stock-movements.contract.ts
│       ├── stock-movements.controller.ts
│       ├── stock-movements.route.ts
│       └── stock-movements.service.ts
│
├── generated/
│   └── prisma/
│
└── index.ts
```

Setiap feature memiliki empat layer:

```text
contract
controller
route
service
```

Pattern tersebut digunakan secara konsisten untuk seluruh module.

---

# 5. Database

Database menggunakan PostgreSQL dan Prisma ORM.

## Entity Relationship

```text
User
 │
 ├───────────────┐
 │               │
 │               │
 ▼               ▼
Product      StockMovement
 │               ▲
 │               │
 ▼               │
Category         │
 └───────────────┘
```

Relasi utama:

```text
User 1 ──── N Product
User 1 ──── N StockMovement

Category 1 ──── N Product

Product 1 ──── N StockMovement
```

---

# 6. Prisma Schema

Entity utama:

## User

```text
id
name
email
emailVerified
image
createdAt
updatedAt
```

Relasi:

```text
User
├── sessions
├── accounts
├── products
└── stockMovements
```

---

## Category

```text
id
name
description
createdAt
updatedAt
```

Relasi:

```text
Category
└── products
```

Nama kategori bersifat unique.

---

## Product

```text
id
categoryId
createdBy
sku
name
description
price
stock
minStock
unit
imageUrl
status
createdAt
updatedAt
```

Relasi:

```text
Product
├── category
├── creator
└── movements
```

`createdBy` merupakan foreign key ke `User`.

Relation Prisma-nya menggunakan nama:

```text
creator
```

---

## StockMovement

```text
id
productId
userId
type
quantity
stockBefore
stockAfter
note
createdAt
```

Relasi:

```text
StockMovement
├── product
└── user
```

`userId` digunakan untuk mengetahui user yang melakukan perubahan stok.

---

# 7. Authentication

Authentication menggunakan Better Auth.

Endpoint yang bersifat public:

```text
POST /users/create
POST /users/sign-in
```

Endpoint yang membutuhkan authentication menggunakan:

```text
authMiddleware
```

Middleware mengambil session dari Better Auth:

```ts
const session = await auth.api.getSession({
  headers: c.req.raw.headers,
});
```

Jika session tidak ditemukan:

```text
401 UNAUTHORIZED
```

Jika berhasil, user dan session disimpan pada Hono Context:

```ts
c.set('user', session.user);
c.set('session', session.session);
```

Controller protected dapat mengambil user:

```ts
const user = c.get('user');
```

---

# 8. Base URL

Development:

```text
http://localhost:3000/api
```

Contoh:

```text
GET http://localhost:3000/api/products
```

Sesuaikan port dengan konfigurasi server project.

---

# 9. API Specification

## Authentication

### Register

```http
POST /api/users/create
```

Authentication:

```text
Public
```

Request:

```json
{
  "name": "Ilham",
  "email": "ilham@example.com",
  "password": "password123"
}
```

Validasi:

| Field    | Type   | Required | Aturan                             |
| -------- | ------ | -------: | ---------------------------------- |
| name     | string |       Ya | 2–100 karakter                     |
| email    | string |       Ya | Email valid, maksimal 255 karakter |
| password | string |       Ya | 8–100 karakter                     |

Response mengikuti response Better Auth.

---

## Login

```http
POST /api/users/sign-in
```

Authentication:

```text
Public
```

Request:

```json
{
  "email": "ilham@example.com",
  "password": "password123",
  "rememberMe": true
}
```

Field:

| Field      | Type    | Required |
| ---------- | ------- | -------: |
| email      | string  |       Ya |
| password   | string  |       Ya |
| rememberMe | boolean |    Tidak |

`rememberMe` default:

```text
false
```

Response mengikuti response Better Auth.

---

## Update Profile

```http
PATCH /api/users/update-profile
```

Authentication:

```text
Required
```

Request:

```json
{
  "name": "Ilham"
}
```

Field:

| Field | Type   | Required |
| ----- | ------ | -------: |
| name  | string |       Ya |

Response:

```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "Ilham",
    "email": "ilham@example.com"
  }
}
```

---

# 10. Category API

Semua endpoint category membutuhkan authentication.

## Get All Categories

```http
GET /api/categories
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "category-id",
      "name": "Elektronik",
      "description": "Produk elektronik",
      "createdAt": "2026-08-14T05:00:00.000Z",
      "updatedAt": "2026-08-14T05:00:00.000Z"
    }
  ]
}
```

---

## Get Category Detail

```http
GET /api/categories/:id
```

Contoh:

```http
GET /api/categories/cml123
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "cml123",
    "name": "Elektronik",
    "description": "Produk elektronik",
    "createdAt": "2026-08-14T05:00:00.000Z",
    "updatedAt": "2026-08-14T05:00:00.000Z"
  }
}
```

Jika tidak ditemukan:

```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_NOT_FOUND",
    "message": "Kategori tidak ditemukan."
  }
}
```

---

## Create Category

```http
POST /api/categories
```

Request:

```json
{
  "name": "Elektronik",
  "description": "Produk elektronik"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "category-id",
    "name": "Elektronik",
    "description": "Produk elektronik",
    "createdAt": "2026-08-14T05:00:00.000Z",
    "updatedAt": "2026-08-14T05:00:00.000Z"
  }
}
```

HTTP status:

```text
201 Created
```

---

## Update Category

```http
PATCH /api/categories/:id
```

Request dapat berupa partial update:

```json
{
  "name": "Elektronik & Gadget"
}
```

atau:

```json
{
  "description": "Produk elektronik dan gadget"
}
```

Minimal satu field harus dikirim.

---

## Delete Category

```http
DELETE /api/categories/:id
```

Response:

```json
{
  "success": true,
  "message": "Kategori berhasil dihapus."
}
```

Jika category masih digunakan oleh product, database foreign key dapat menyebabkan operasi delete gagal.

---

# 11. Product API

Semua endpoint product membutuhkan authentication.

## Get All Products

```http
GET /api/products
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "product-id",
      "categoryId": "category-id",
      "createdBy": "user-id",
      "sku": "KB-MECH-001",
      "name": "Keyboard Mechanical",
      "description": "Keyboard mechanical RGB",
      "price": "750000",
      "stock": 20,
      "minStock": 5,
      "unit": "pcs",
      "imageUrl": null,
      "status": "active",
      "category": {
        "id": "category-id",
        "name": "Elektronik"
      }
    }
  ]
}
```

---

## Get Product Detail

```http
GET /api/products/:id
```

Contoh:

```http
GET /api/products/product-id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "product-id",
    "sku": "KB-MECH-001",
    "name": "Keyboard Mechanical",
    "price": "750000",
    "stock": 20,
    "minStock": 5,
    "unit": "pcs",
    "status": "active",
    "category": {
      "id": "category-id",
      "name": "Elektronik"
    }
  }
}
```

---

## Create Product

```http
POST /api/products
```

Authentication:

```text
Required
```

Request:

```json
{
  "name": "Keyboard Mechanical",
  "sku": "KB-MECH-001",
  "description": "Keyboard mechanical RGB",
  "price": 750000,
  "stock": 20,
  "categoryId": "category-id"
}
```

Field utama:

| Field       | Type        | Required |
| ----------- | ----------- | -------: |
| name        | string      |       Ya |
| sku         | string      |       Ya |
| description | string/null |    Tidak |
| price       | number      |       Ya |
| stock       | integer     |       Ya |
| categoryId  | string      |       Ya |

`createdBy` **tidak dikirim dari client**.

Nilai tersebut diambil dari authenticated user:

```text
session.user.id
```

dan disimpan sebagai:

```text
Product.createdBy
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "product-id",
    "name": "Keyboard Mechanical",
    "sku": "KB-MECH-001",
    "price": "750000",
    "stock": 20,
    "categoryId": "category-id"
  }
}
```

HTTP status:

```text
201 Created
```

---

## Update Product

```http
PATCH /api/products/:id
```

Request:

```json
{
  "name": "Keyboard Mechanical RGB",
  "price": 800000
}
```

Semua field bersifat optional, tetapi minimal satu field harus dikirim.

Contoh:

```json
{
  "stock": 25
}
```

> Untuk perubahan stok melalui sistem, lebih baik menggunakan endpoint Stock Movement daripada mengubah `stock` secara langsung. Hal ini menjaga audit trail stok.

---

## Delete Product

```http
DELETE /api/products/:id
```

Response:

```json
{
  "success": true,
  "message": "Produk berhasil dihapus."
}
```

---

# 12. Stock Movement API

Stock Movement digunakan untuk mencatat semua perubahan stok.

Semua endpoint membutuhkan authentication.

Tidak tersedia endpoint update/delete untuk stock movement karena movement merupakan histori transaksi.

---

## Get All Stock Movements

```http
GET /api/stock-movements
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "movement-id",
      "productId": "product-id",
      "userId": "user-id",
      "type": "IN",
      "quantity": 10,
      "stockBefore": 20,
      "stockAfter": 30,
      "note": "Restock",
      "createdAt": "2026-08-14T05:00:00.000Z"
    }
  ]
}
```

---

## Get Stock Movement Detail

```http
GET /api/stock-movements/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "movement-id",
    "productId": "product-id",
    "userId": "user-id",
    "type": "IN",
    "quantity": 10,
    "stockBefore": 20,
    "stockAfter": 30,
    "note": "Restock",
    "createdAt": "2026-08-14T05:00:00.000Z",
    "product": {
      "id": "product-id",
      "name": "Keyboard Mechanical",
      "sku": "KB-MECH-001"
    },
    "user": {
      "id": "user-id",
      "name": "Ilham",
      "email": "ilham@example.com"
    }
  }
}
```

---

## Get Product Stock History

```http
GET /api/stock-movements/product/:productId
```

Contoh:

```http
GET /api/stock-movements/product/product-id
```

Digunakan untuk mendapatkan seluruh histori perubahan stok sebuah product.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "movement-1",
      "type": "IN",
      "quantity": 20,
      "stockBefore": 0,
      "stockAfter": 20,
      "note": "Stock awal",
      "createdAt": "2026-08-14T05:00:00.000Z"
    },
    {
      "id": "movement-2",
      "type": "OUT",
      "quantity": 5,
      "stockBefore": 20,
      "stockAfter": 15,
      "note": "Barang rusak",
      "createdAt": "2026-08-14T06:00:00.000Z"
    }
  ]
}
```

---

# 13. Create Stock Movement

```http
POST /api/stock-movements
```

Authentication:

```text
Required
```

Request:

```json
{
  "productId": "product-id",
  "type": "IN",
  "quantity": 10,
  "note": "Restock dari supplier"
}
```

## Stock IN

Digunakan ketika stok bertambah.

```json
{
  "productId": "product-id",
  "type": "IN",
  "quantity": 10,
  "note": "Pembelian barang"
}
```

Jika stok sebelumnya:

```text
20
```

Maka:

```text
stockBefore = 20
quantity    = 10
stockAfter  = 30
```

---

## Stock OUT

Digunakan ketika stok berkurang.

```json
{
  "productId": "product-id",
  "type": "OUT",
  "quantity": 5,
  "note": "Barang rusak"
}
```

Jika stok sebelumnya:

```text
30
```

Maka:

```text
stockBefore = 30
quantity    = 5
stockAfter  = 25
```

Jika jumlah OUT lebih besar dari stok tersedia, request ditolak:

```text
400 INSUFFICIENT_STOCK
```

---

## Stock ADJUSTMENT

Digunakan untuk menyesuaikan stok berdasarkan stok aktual, misalnya setelah stock opname.

```json
{
  "productId": "product-id",
  "type": "ADJUSTMENT",
  "quantity": 27,
  "note": "Hasil stock opname"
}
```

Jika stok database:

```text
20
```

dan hasil stock opname:

```text
27
```

maka:

```text
stockBefore = 20
stockAfter  = 27
quantity    = 27
```

Untuk `ADJUSTMENT`, `quantity` berarti **stok aktual**, bukan jumlah selisih.

---

# 14. Stock Transaction

Perubahan stock dan pembuatan stock movement dilakukan dalam satu database transaction:

```text
POST /stock-movements
        │
        ▼
Find Product
        │
        ▼
stockBefore
        │
        ▼
Calculate stockAfter
        │
        ▼
Create StockMovement
        │
        ▼
Update Product.stock
        │
        ▼
Commit Transaction
```

Prisma menggunakan:

```ts
prisma.$transaction(async (tx) => {
  // ...
});
```

Tujuannya menjaga konsistensi:

```text
StockMovement.stockAfter
        =
Product.stock
```

Jika salah satu operasi gagal, seluruh transaction di-rollback.

---

# 15. Authentication Middleware

Middleware:

```text
src/middlewares/auth.middleware.ts
```

digunakan pada route protected.

Contoh:

```ts
products.use('*', authMiddleware);
```

Dengan demikian semua endpoint:

```text
GET    /products
GET    /products/:id
POST   /products
PATCH  /products/:id
DELETE /products/:id
```

memerlukan authentication.

Untuk endpoint tertentu:

```ts
users.patch('/update-profile', authMiddleware, userController.updateProfile);
```

Authentication dilakukan menggunakan Better Auth.

---

# 16. API Route Registration

Root route:

```ts
import { Hono } from 'hono';

import users from './users/users.route';
import categories from './categories/categories.route';
import products from './products/products.route';
import stockMovements from './stock-movements/stock-movements.route';

const routes = new Hono();

routes.route('/users', users);
routes.route('/categories', categories);
routes.route('/products', products);
routes.route('/stock-movements', stockMovements);

export default routes;
```

Jika route utama dipasang:

```ts
app.route('/api', routes);
```

maka base API:

```text
/api
```

---

# 17. Ringkasan API

| Method | Endpoint                              | Auth | Fungsi              |
| ------ | ------------------------------------- | ---: | ------------------- |
| POST   | `/users/create`                       |   No | Registrasi          |
| POST   | `/users/sign-in`                      |   No | Login               |
| PATCH  | `/users/update-profile`               |  Yes | Update profile      |
| GET    | `/categories`                         |  Yes | Daftar kategori     |
| GET    | `/categories/:id`                     |  Yes | Detail kategori     |
| POST   | `/categories`                         |  Yes | Buat kategori       |
| PATCH  | `/categories/:id`                     |  Yes | Update kategori     |
| DELETE | `/categories/:id`                     |  Yes | Hapus kategori      |
| GET    | `/products`                           |  Yes | Daftar produk       |
| GET    | `/products/:id`                       |  Yes | Detail produk       |
| POST   | `/products`                           |  Yes | Buat produk         |
| PATCH  | `/products/:id`                       |  Yes | Update produk       |
| DELETE | `/products/:id`                       |  Yes | Hapus produk        |
| GET    | `/stock-movements`                    |  Yes | Semua histori stok  |
| GET    | `/stock-movements/:id`                |  Yes | Detail movement     |
| GET    | `/stock-movements/product/:productId` |  Yes | Histori stok produk |
| POST   | `/stock-movements`                    |  Yes | Buat movement       |

---

# 18. HTTP Status Code

Status code yang digunakan:

| Status | Arti                                                   |
| -----: | ------------------------------------------------------ |
|    200 | Request berhasil                                       |
|    201 | Resource berhasil dibuat                               |
|    400 | Request tidak valid / business rule gagal              |
|    401 | Belum terautentikasi                                   |
|    403 | Tidak memiliki permission                              |
|    404 | Resource tidak ditemukan                               |
|    409 | Conflict, misalnya data unique sudah digunakan         |
|    422 | Validation error, jika digunakan oleh global validator |
|    500 | Internal server error                                  |

---

# 19. Error Response

Error aplikasi menggunakan `AppError`.

Format response yang direkomendasikan:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Produk tidak ditemukan."
  }
}
```

Contoh unauthorized:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Autentikasi Diperlukan."
  }
}
```

Contoh stok tidak cukup:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Stok tidak mencukupi."
  }
}
```

Error Prisma dan Zod sebaiknya diproses oleh **global exception handler**, bukan menggunakan `try/catch` berulang di setiap controller.

---

# 20. Validasi

Validasi request menggunakan Zod.

Contoh:

```ts
const dto = createProductSchema.parse(body);
```

Contract bertanggung jawab terhadap:

```text
Required field
String length
Email format
Number validation
Integer validation
Enum validation
Partial update
Cross-field validation
```

Contoh password:

```text
Minimal 8 karakter
Maksimal 100 karakter
```

Contoh stock:

```text
Integer
Positive
```

---

# 21. Prinsip Business Logic

## Product

Product menyimpan kondisi stok saat ini:

```text
Product.stock
```

Product bukan histori.

---

## Stock Movement

Stock Movement menyimpan perubahan stok:

```text
stockBefore
quantity
stockAfter
```

Stock Movement bersifat append-only.

Tidak disediakan:

```text
PATCH /stock-movements/:id
DELETE /stock-movements/:id
```

Jika terjadi kesalahan pencatatan, buat movement koreksi baru.

---

# 22. Contoh Alur Penggunaan

Misalnya product memiliki:

```text
Keyboard Mechanical
Stock = 0
```

Kemudian user melakukan stock masuk:

```json
{
  "productId": "product-1",
  "type": "IN",
  "quantity": 50,
  "note": "Pembelian awal"
}
```

Database menjadi:

```text
Product.stock = 50
```

Stock movement:

```text
stockBefore = 0
quantity    = 50
stockAfter  = 50
```

Kemudian ada barang keluar:

```json
{
  "productId": "product-1",
  "type": "OUT",
  "quantity": 5,
  "note": "Barang rusak"
}
```

Database menjadi:

```text
Product.stock = 45
```

Movement:

```text
stockBefore = 50
quantity    = 5
stockAfter  = 45
```

---

# 23. Development

Install dependency:

```bash
bun install
```

Generate Prisma Client:

```bash
bunx prisma generate
```

Menjalankan development server:

```bash
bun run dev
```

Lint:

```bash
bun run lint
```

---

# 24. Environment Variable

Contoh konfigurasi:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/inventory"

BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3000"
```

Jangan commit file `.env` ke repository.

Gunakan `.env.example`:

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
```

---

# 25. Prisma

Generate Prisma Client:

```bash
bunx prisma generate
```

Migration:

```bash
bunx prisma migrate dev
```

Membuka Prisma Studio:

```bash
bunx prisma studio
```

---

# 26. Development Guidelines

Ketika menambahkan feature baru, gunakan struktur:

```text
features/
└── feature-name/
    ├── feature-name.contract.ts
    ├── feature-name.controller.ts
    ├── feature-name.route.ts
    └── feature-name.service.ts
```

## Contract

Berisi:

```text
Zod schema
Input type
Validation rule
```

## Controller

Berisi:

```text
HTTP request
Zod parsing
Service call
HTTP response
```

## Service

Berisi:

```text
Business logic
Prisma query
Transaction
Better Auth integration jika diperlukan
```

## Route

Berisi:

```text
Endpoint
HTTP method
Middleware
Controller mapping
```

---

# 27. Prinsip Authentication

Jangan mengirim user ID dari frontend untuk menentukan user yang melakukan operasi.

Tidak disarankan:

```json
{
  "productId": "product-1",
  "userId": "user-123"
}
```

User ID harus diambil dari authenticated session:

```ts
const user = c.get('user');

user.id;
```

Contohnya ketika membuat Stock Movement:

```text
Client
  ↓
POST /stock-movements
  ↓
Auth Middleware
  ↓
session.user.id
  ↓
StockMovementService
  ↓
userId
```

Hal ini mencegah client memalsukan identitas user.

---

# 28. Prinsip Stock Management

Jangan mengubah:

```text
Product.stock
```

secara langsung untuk operasi inventory normal.

Gunakan:

```text
Stock Movement
```

sebagai sumber perubahan.

Contoh:

```text
Stock IN
Stock OUT
Stock ADJUSTMENT
```

Service kemudian mengubah:

```text
Product.stock
```

dalam transaction yang sama.

---

# 29. Future Development

Fitur yang dapat dikembangkan setelah MVP:

```text
Supplier
Purchase Order
Goods Receipt
Sales Order
Stock Transfer
Multiple Warehouse
Warehouse Stock
Stock Opname
Low Stock Alert
Product Search
Product Pagination
Filtering
Sorting
Dashboard Analytics
Role & Permission
Audit Log
```

Untuk multi-branch atau multi-warehouse, struktur stock sebaiknya dikembangkan dari:

```text
Product.stock
```

menjadi konsep:

```text
Product
   │
   ▼
Warehouse / Branch
   │
   ▼
Inventory
```

sehingga satu product dapat memiliki stok berbeda di setiap lokasi.

---

# 30. Status Project

Saat ini MVP backend mencakup:

```text
[x] Authentication
[x] User
[x] Category
[x] Product
[x] Stock Movement
[x] Stock IN
[x] Stock OUT
[x] Stock ADJUSTMENT
[x] Authentication Middleware
[x] Zod Validation
[x] Prisma ORM
[x] PostgreSQL
[x] Transaction Stock
[x] Global Error Handling
```
