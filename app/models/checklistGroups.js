const mongoose = require('../../database');

const ChecklistGroupsSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    itens: [{type: mongoose.Schema.Types.ObjectId, ref: 'ChecklistItens'}]
});

const ChecklistGroups = mongoose.model('ChecklistGroups', ChecklistGroupsSchema);

module.exports = ChecklistGroups;