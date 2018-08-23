const mongoose = require('../../database');

const VehicleSchema = new mongoose.Schema({
    plate: {
        type: String,
        required: false,
    },
    vin: {
        type: String,
        required: false,
    },
    renavam: {
        type: String,
        required: false,
    },
    model: {
        type: String,
        required: false,
    },
    kind: {
        type: String,
        required: false,
    },
    vehicleType: {
        type: String,
        required: false,
    },
    bodywork: {
        type: String,
        required: false,
    },
    category: {
        type: String,
        required: false,
    },
    fuel: {
        type: String,
        required: false,
    },
    color: {
        type: String,
        required: false,
    },
    manufacturingYear: {
        type: Number,
        required: false,
    },
    modelYear: {
        type: Number,
        required: false,
    },
    cylinder: {
        type: Number,
        required: false,
    },
    power: {
        type: Number,
        required: false,
    },
    passengers: {
        type: Number,
        required: false,
    },
    CMT: {
        type: Number,
        default: false
    },
    capacityLoad: {
        type: Number,
        default: false
    },
    PBT: {
        type: Number,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Vehicle = mongoose.model('Vehicle', VehicleSchema);

module.exports = Vehicle;