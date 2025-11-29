const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://keilynrosasprofissional_db_user:winy123@clusterd.f8596rv.mongodb.net/sofia-bot";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Conectado!');
    } catch (error) {
        console.error('❌ Erro ao conectar MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;