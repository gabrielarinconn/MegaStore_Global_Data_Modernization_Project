const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
    action: String,
    entity: String,
    data: Object, // Aquí se guarda el producto completo que borraste
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditSchema);
