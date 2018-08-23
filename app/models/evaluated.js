const mongoose = require('../../database');

const EvaluatedSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
    modality: {type: mongoose.Schema.Types.ObjectId, ref: 'Modality'},
    vehicle: {type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle'},
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

const Evaluated = mongoose.model('Evaluated', EvaluatedSchema);

module.exports = Evaluated;