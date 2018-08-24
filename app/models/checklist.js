const mongoose = require('../../database');

const ChecklistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'ChecklistGroups'}],
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Checklist = mongoose.model('Checklist', ChecklistSchema);

module.exports = Checklist;