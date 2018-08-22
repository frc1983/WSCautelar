const mongoose = require('../../database');

const ChecklistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'ChecklistGroups'}],
    active: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Checklist = mongoose.model('Checklist', ChecklistSchema);

module.exports = Checklist;