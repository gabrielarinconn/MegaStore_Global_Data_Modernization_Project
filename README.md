# MegaStore Global Data Modernization Project

## 1. Introduction
This project aims to migrate the legacy system of "MegaStore Global" from a single, unmanageable Excel file into a modern, scalable, and persistent architecture. The solution involves an **hybrid database approach** (SQL + NoSQL) and a RESTful API built with Node.js and Express.

## 2. Architecture Justification

### Data Modeling & Distribution


| Database | Technology | Entities | Justification |
| :--- | :--- | :--- | :--- |
| **Relational** | PostgreSQL | Customers, Products, Suppliers, Orders, OrderDetails | **ACID Compliance:** High need for referential integrity. Ensures accurate pricing, stock levels, and customer relationships. **Normalised to 3FN** to eliminate data redundancy. |
| **NoSQL** | MongoDB | ProductCatalog, AuditLog | **Flexibility & Read Speed:** Product attributes vary widely. Used for fast lookup. **AuditLogs:** Fast write operations for logging deletions. |

### Data Migration & Idempotency
To migrate data from the raw CSV file without creating duplicates (e.g., a customer appearing in multiple transactions), an `upsert` (Update or Insert) strategy is used.
* **SQL:** Uses `ON CONFLICT (constraint) DO UPDATE` to update existing records or insert new ones based on unique fields like Email or SKU.
* **NoSQL:** Uses `db.collection.updateOne(..., {upsert: true})`.

## 3. Project Setup and Deployment

### Prerequisites
* Node.js (v16+)
* PostgreSQL
* MongoDB

### Steps
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd megastore-backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Setup Databases:**
    * Run the script `docs/schema.sql` in your PostgreSQL instance to create the schema.
    * Start your MongoDB instance.
4.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    PG_URI=postgres://user:password@localhost:5432/db_megastore_exam
    MONGO_URI=mongodb://localhost:27017/db_megastore_exam
    ```
5.  **Run Migration:**
    Execute the migration script to populate the databases:
    ```bash
    node scripts/migrate.js
    ```
6.  **Start API:**
    ```bash
    npm start
    ```

## 4. API Endpoints
The REST API allows management of products and provides BI insights. Import the `postman_collection.json` file located in the `/docs` folder into Postman.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/products` | Get all products |
| **POST** | `/api/products` | Create a new product |
| **DELETE** | `/api/products/:id` | Delete a product (logs to MongoDB) |
| **GET** | `/api/bi/suppliers` | BI: Supplier performance report |
| **GET** | `/api/bi/customer/:id` | BI: Customer purchase history |

## 5. Audit Log (MongoDB)
Every time a product is deleted via the API, a detailed document is created in the `audit_logs` collection in MongoDB for tracking purposes.
