const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    registration: { type: String },
    stage: { type: Number, default: 0 },
    subStage: { type: String, default: '' },
    lastInteraction: { type: Date, default: Date.now },
    context: { 
        type: mongoose.Schema.Types.Mixed, 
        default: { 
            attempts: 0,
            menuAttempts: 0,
            financeAttempts: 0,
            academicAttempts: 0,
            postMenuAttempts: 0
        } 
    }
});

module.exports = mongoose.model('User', userSchema);