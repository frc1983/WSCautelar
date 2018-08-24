const mongoose = require('../../database');

const ChecklistConditionSchema = new mongoose.Schema({
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

const ChecklistCondition = mongoose.model('ChecklistCondition', ChecklistConditionSchema);

module.exports = ChecklistCondition;