# MegaStore Global Data Modernization Project

## 1. Introduction
This project aims to migrate the legacy system of "MegaStore Global" from a single, unmanageable Excel file into a modern, scalable, and persistent architecture. The solution involves a **hybrid database approach** (SQL + NoSQL) and a RESTful API built with Node.js and Express.

## 2. Architecture Justification

### Data Modeling & Distribution


| Database | Technology | Entities | Justification |
| :--- | :--- | :--- | :--- |
| **Relational** | PostgreSQL | Customers, Products, Suppliers, Orders, OrderDetails | **ACID Compliance:** High need for referential integrity. Ensures accurate pricing and customer relationships. **Normalised to 3FN**. |
| **NoSQL** | MongoDB | AuditLog | **Write Speed:** Fast write operations for logging deletions and storing "ghost" objects of deleted products for auditing. |

### Data Migration & Idempotency
To migrate data from the raw CSV file without creating duplicates, an `upsert` (Update or Insert) strategy is used.
* **SQL:** Uses `ON CONFLICT (constraint) DO UPDATE` to update existing records or insert new ones based on unique fields like Email or SKU.
* **NoSQL:** Uses Mongoose models to ensure schema consistency during audit logging.

---

## 3. Project Setup and Deployment

### Prerequisites
* Node.js (v16+)
* PostgreSQL
* MongoDB

### Steps
1.  **Clone the repository:**
    ```bash
    git clone https://github.com
    cd megastore-backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Setup Databases:**
    * Run the script `docs/schema.sql` in your PostgreSQL instance to create the schema.
    * **PostgreSQL Password Setup (Optional):**
      ```bash
      sudo -u postgres psql
      ALTER USER postgres WITH PASSWORD 'Asd.123';
      CREATE DATABASE db_megastore_exam;
      ```
4.  **Configure Environment Variables:**
    ```
    sudo -u  postgres psql
    ```
    Ingresa contraseña de tu equipo
    Luego
    ```
    ALTER USER postgres WITH PASSWORD 'Asd123'
    ```
    Creas la base de datos
    ```
    create database  db_megastore_exam
    ```
    
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    PG_URI=postgres://postgres:Asd123@localhost:5432/db_megastore_exam
    MONGO_URI=mongodb://localhost:27017/db_megastore_exam
    ```
5.  **Start API:**
    ```bash
    node src/app.js
    ```

---

## 4. How to Test (Step-by-Step)

### Phase 1: Data Migration
Trigger the CSV import into PostgreSQL.
* **Method:** `POST`
* **URL:** `http://localhost:3000/migrate`
* **Verification:** Check the console for "Migration Finished" and verify records in your SQL tables.

### Phase 2: Business Intelligence (BI)
Test the complex SQL joins:
1. **Supplier Analysis:** `GET /api/products/analysis/suppliers`
2. **Customer History:** `GET /api/products/history/customer/:email`
3. **Top Selling by Category:** `GET /api/products/top-selling/:category`

### Phase 3: Hybrid Audit (SQL + NoSQL)
1. Pick an existing `product_id` from your PostgreSQL `Products` table.
2. **Method:** `DELETE`
3. **URL:** `http://localhost:3000/api/products/:id`
4. **Validation:**
   * **PostgreSQL:** The product is removed.
   * **MongoDB:** A new document appears in the `auditlogs` collection containing the deleted product's data.

---

## 5. API Endpoints


| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/migrate` | Starts the CSV to SQL migration process |
| **DELETE** | `/api/products/:id` | Deletes from SQL and audits in MongoDB |
| **GET** | `/api/products/analysis/suppliers` | BI: Supplier inventory value report |
| **GET** | `/api/products/history/customer/:email` | BI: Detailed purchase history by email |
| **GET** | `/api/products/top-selling/:category` | BI: Best selling products by category |
