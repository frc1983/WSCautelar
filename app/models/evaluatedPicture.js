const mongoose = require('../../database');

const EvaluatedPictureSchema = new mongoose.Schema({
    evaluated: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluated', require: true },
    picture: {
        type: Number,
        required: true
    },
    sample: {
        type: Number,
        required: true,
        default: 1
    },
    path: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const EvaluatedPicture = mongoose.model('EvaluatedPicture', EvaluatedPictureSchema);

module.exports = EvaluatedPicture;