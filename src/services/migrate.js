const fs = require('fs');
const csv = require('csv-parser');
const pool = require('../config/db');

const startMigration = (filePath) => {
    console.log('--- Iniciando Migración ---');
    
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
            try {
                // 1. Insertar Proveedor (Idempotente)
                const supplier = await pool.query(
                    'INSERT INTO Suppliers (name, contact_name) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING supplier_id',
                    [row['Nombre Proveedor'], row['Contacto Proveedor']]
                );
                const supplierId = supplier.rows[0].supplier_id;

                // 2. Insertar Cliente (Idempotente)
                const customer = await pool.query(
                    'INSERT INTO Customers (name, email, address) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email RETURNING customer_id',
                    [row['Nombre Cliente'], row['Email Cliente'], row['Dirección']]
                );
                const customerId = customer.rows[0].customer_id;

                // 3. Insertar Producto
                const product = await pool.query(
                    'INSERT INTO Products (sku, name, category, unit_price, supplier_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (sku) DO UPDATE SET sku=EXCLUDED.sku RETURNING product_id',
                    [row.SKU, row['Nombre Producto'], row['Categoría Producto'], row['Precio Unitario'], supplierId]
                );
                const productId = product.rows[0].product_id;

                // 4. Insertar Orden
                const order = await pool.query(
                    'INSERT INTO Orders (transaction_id, customer_id, order_date) VALUES ($1, $2, $3) ON CONFLICT (transaction_id) DO UPDATE SET transaction_id=EXCLUDED.transaction_id RETURNING order_id',
                    [row['ID Transacción'], customerId, row.Fecha]
                );
                const orderId = order.rows[0].order_id;

                // 5. Insertar Detalles de la Orden
                await pool.query(
                    'INSERT INTO OrderDetails (order_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)',
                    [orderId, productId, row.Cantidad, row['Precio Unitario']]
                );

            } catch (err) {
                console.error('Error procesando fila:', row['ID Transacción'], err.message);
            }
        })
        .on('end', () => {
            console.log('--- Migración Finalizada con éxito ---');
        });
};

module.exports = startMigration;
