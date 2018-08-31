const mongoose = require('../../database');

const ChecklistItemSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    conditions: [{type: mongoose.Schema.Types.ObjectId, ref: 'ChecklistCondition'}]
});

const ChecklistItem = mongoose.model('ChecklistItem', ChecklistItemSchema);

module.exports = ChecklistItem;