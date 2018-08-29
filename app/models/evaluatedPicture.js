const mongoose = require('../../database');

const EvaluatedPictureSchema = new mongoose.Schema({
    evaluated: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluated', require: true },
    picture: { type: mongoose.Schema.Types.ObjectId, ref: 'Picture', require: true },
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