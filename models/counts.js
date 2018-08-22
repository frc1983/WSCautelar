const mongoose = require('../database');

const CountsSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Counts = mongoose.model('Counts', CountsSchema);

module.exports = Counts;