const mongoose = require('../database');

const EvaluatedChecklistSchema = new mongoose.Schema({
    company: {},
    checklist: {},
    evaluatedValues: [{
        groupNumber: {
            type: Number,
            require: true
        },
        itemNumber: {
            type: Number,
            require: true
        },
        conditionNumber: {
            type: Number,
            require: true
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const EvaluatedChecklist = mongoose.model('EvaluatedChecklist', EvaluatedChecklistSchema);

module.exports = EvaluatedChecklist;