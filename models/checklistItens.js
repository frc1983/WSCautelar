const mongoose = require('../database');

const ChecklistItensSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    conditions: [{type: mongoose.Schema.Types.ObjectId, ref: 'ChecklistConditions'}]
});

const ChecklistItens = mongoose.model('ChecklistItens', ChecklistItensSchema);

module.exports = ChecklistItens;