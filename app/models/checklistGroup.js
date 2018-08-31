const mongoose = require('../../database');

const ChecklistGroupSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    itens: [{type: mongoose.Schema.Types.ObjectId, ref: 'ChecklistItem'}]
});

const ChecklistGroup = mongoose.model('ChecklistGroup', ChecklistGroupSchema);

module.exports = ChecklistGroup;