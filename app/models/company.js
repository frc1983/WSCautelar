const mongoose = require('../../database');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    CNPJ: {
        type: String,
        unique: true,
        required: true
    },
    active: { 
        type: Boolean, 
        default: false 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;