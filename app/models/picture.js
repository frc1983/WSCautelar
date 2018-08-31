const mongoose = require('../../database');

const PictureSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
        unique: true
    },
    samples: {
        type: Number,
        required: true,
        default: 1
    },
    required: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Picture = mongoose.model('Picture', PictureSchema);

module.exports = Picture;