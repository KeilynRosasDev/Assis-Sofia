const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    registration: { type: String },
    stage: { type: Number, default: 0 },
    subStage: { type: String, default: '' },
    lastInteraction: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);