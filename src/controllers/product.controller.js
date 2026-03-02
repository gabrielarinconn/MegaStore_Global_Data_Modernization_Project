// controllers/product.controller.js
const AuditLog = require('../models/audit.model'); 
const pool = require('../config/db');

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Obtener datos antes de borrar
        const product = await pool.query('SELECT * FROM Products WHERE product_id = $1', [id]);
        
        // 2. Borrar en SQL
        await pool.query('DELETE FROM Products WHERE product_id = $1', [id]);

        // 3. Registrar en MongoDB (Auditoría)
        await AuditLog.create({
            action: 'DELETE',
            entity: 'Product',
            data: product.rows[0],
            timestamp: new Date()
        });

        res.status(200).json({ message: 'Product deleted and audited' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 1. Análisis de proveedores (Cantidad de productos y valor total de inventario)
exports.getSuppliersAnalysis = async (req, res) => {
    try {
        const query = `
            SELECT s.name AS supplier_name, 
                   SUM(od.quantity) AS total_items_sold,
                   SUM(od.quantity * od.price_at_time) AS total_inventory_value
            FROM Suppliers s
            JOIN Products p ON s.supplier_id = p.supplier_id
            JOIN OrderDetails od ON p.product_id = od.product_id
            GROUP BY s.name
            ORDER BY total_inventory_value DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Comportamiento del cliente (Historial de compras detallado)
exports.getCustomerHistory = async (req, res) => {
    const { email } = req.params;
    try {
        const query = `
            SELECT c.name, o.order_date, p.name AS product, od.quantity, od.price_at_time,
                   (od.quantity * od.price_at_time) AS total_spent
            FROM Customers c
            JOIN Orders o ON c.customer_id = o.customer_id
            JOIN OrderDetails od ON o.order_id = od.order_id
            JOIN Products p ON od.product_id = p.product_id
            WHERE c.email = $1
            ORDER BY o.order_date DESC;
        `;
        const result = await pool.query(query, [email]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Productos estrella (Más vendidos por categoría)
exports.getTopProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const query = `
            SELECT p.name, p.category, SUM(od.quantity) AS units_sold,
                   SUM(od.quantity * od.price_at_time) AS total_revenue
            FROM Products p
            JOIN OrderDetails od ON p.product_id = od.product_id
            WHERE p.category ILIKE $1
            GROUP BY p.name, p.category
            ORDER BY total_revenue DESC;
        `;
        const result = await pool.query(query, [category]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
