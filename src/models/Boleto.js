const mongoose = require('mongoose');

const boletoSchema = new mongoose.Schema({
    registration: { type: String, required: true },
    fileName: { type: String, required: true },
    dueDate: { type: Date },
    amount: { type: Number },
    paid: { type: Boolean, default: false }
});

module.exports = mongoose.model('Boleto', boletoSchema);