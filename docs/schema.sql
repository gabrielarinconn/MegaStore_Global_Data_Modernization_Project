-- =======================================================
-- Database: db_megastore_exam
-- Engine: PostgreSQL
-- Purpose: Schema Definition for Migration
-- =======================================================

-- 1. Suppliers Table (Relational - Normal form)
CREATE TABLE Suppliers (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE, -- UNIQUE para idempotencia
    contact_name VARCHAR(255)
);

-- 2. Products Table (Relational - Normal form)
CREATE TABLE Products (
    product_id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL, -- UNIQUE para idempotencia
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit_price DECIMAL(10, 2) NOT NULL,
    supplier_id INTEGER REFERENCES Suppliers(supplier_id)
);

-- 3. Customers Table (Relational - Normal form)
CREATE TABLE Customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL, -- UNIQUE para idempotencia
    address TEXT NOT NULL
);

-- 4. Orders Table (Relational - Normal form)
CREATE TABLE Orders (
    order_id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL, -- UNIQUE para idempotencia
    customer_id INTEGER REFERENCES Customers(customer_id),
    order_date TIMESTAMP NOT NULL
);

-- 5. OrderDetails Table (Relational - Normal form)
CREATE TABLE OrderDetails (
    order_detail_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES Orders(order_id),
    product_id INTEGER REFERENCES Products(product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(10, 2) NOT NULL -- Histórico de precio
);
