const mongoose = require('../../database');

const ModalitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    checklist: { type: mongoose.Schema.Types.ObjectId, ref: 'Checklist' },
    pictures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Picture' }],
    active: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Modality = mongoose.model('Modality', ModalitySchema);

module.exports = Modality;