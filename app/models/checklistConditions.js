const mongoose = require('../../database');

const ChecklistConditionsSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    aproved: {
        type: Boolean,
        default: false
    },
    restriction: {
        type: Boolean,
        default: false
    },
    adulteration: {
        type: Boolean,
        default: false
    }
});

const ChecklistConditions = mongoose.model('ChecklistConditions', ChecklistConditionsSchema);

module.exports = ChecklistConditions;