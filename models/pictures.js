const mongoose = require('../database');

const PictureSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
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