const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Logger = require('../../modules/log');
const Modality = require('../models/modality');
const Vehicle = require('../models/vehicle');
const Company = require('../models/company');
const User = require('../models/user');
const Evaluated = require('../models/evaluated');

const router = express.Router();

router.use(authMiddleware);

router.post('/filter', async (req, res) => {
    const { plate, vin, user, company, initialDate, finalDate } = req.body;

    try {
        if (!initialDate || !finalDate)
            res.status(400).send({ error: "Data inicial e final devem ser preenchidas" });

        await Evaluated.find().select("-evaluatedValues")
            .populate('company')
            .populate('vehicle')
            .populate('user')
            .populate('modality')
            .exec(function (err, docs) {
                if (err)
                    return Logger(res, { error: 'Erro ao filtrar Vistorias' }, err);

                var evaluatedDocs = [];
                docs.filter(function (doc) {
                    var find = doc.evaluationDate >= new Date(initialDate) && doc.evaluationDate <= new Date(finalDate);
                    if (find) evaluatedDocs.push(doc);
                });

                if (company.CNPJ && user.CPF && plate && vin)
                    return res.send({ documents: evaluatedDocs });

                var filteredEvaluations = filterArrayDocs(evaluatedDocs, user, company, vin, plate);
                if (!filteredEvaluations)
                    return res.status(400).send({ error: 'Nenhuma vistoria encontrada' });

                res.send({ documents: filteredEvaluations });
            });
    } catch (err) {
        return Logger(res, { error: 'Erro ao buscar Vistorias' }, err);
    };
});

router.post('/', async (req, res) => {
    const { modality, user, company, vehicle, evaluatedValues, evaluationDate, situation } = req.body;

    try {
        if (!user || !user.CPF)
            return res.status(400).send({ error: "Vistoriador não enviado" });
        else if (!company || !company.CNPJ)
            return res.status(400).send({ error: "Empresa não enviada" });
        else if (!modality || !modality.number)
            return res.status(400).send({ error: "Modalidade não enviada" });
        else if (!vehicle)
            return res.status(400).send({ error: "Veículo não enviado" });

        var userDB = await User.findOne({ "CPF": user.CPF });
        if (!userDB)
            return res.status(400).send({ error: "Usuário não encontrado" });
        var companyDB = await Company.findOne({ "CNPJ": company.CNPJ });
        if (!companyDB)
            return res.status(400).send({ error: "Empresa não encontrada" });
        var modalityDB = await Modality.findOne({ "number": modality.number });
        if (!modalityDB)
            return res.status(400).send({ error: "Modalidade não encontrada" });

        var vehicleDB = await Vehicle.create(vehicle);
        var eval = createModalityObject(userDB, companyDB, modalityDB, vehicleDB, evaluatedValues, evaluationDate, situation);
        await Evaluated.create(eval);

        res.send({ "id": eval.id });
    } catch (err) {
        return Logger(res, { error: 'Erro ao buscar Modalidades' }, err);
    };
});

module.exports = app => app.use('/warranty', router);

function createModalityObject(userDB, companyDB, modalityDB, vehicleDB, evaluatedValues, evaluationDate, situation) {
    var eval = new Evaluated();
    eval.user = userDB;
    eval.company = companyDB;
    eval.modality = modalityDB;
    eval.vehicle = vehicleDB;
    eval.evaluatedValues = evaluatedValues;
    eval.evaluationDate = evaluationDate;
    eval.situation = situation;
    return eval;
}

function filterArrayDocs(evaluatedDocs, user, company, vin, plate) {
    var filteredEvaluations = [];
    evaluatedDocs.forEach(doc => {
        if (user.CPF && doc.user.CPF != user.CPF)
            return;
        if (company.CNPJ && doc.company.CNPJ != company.CNPJ)
            return;
        if (vin && doc.vehicle.vin != vin)
            return;
        if (plate && doc.vehicle.plate != plate)
            return;
        filteredEvaluations.push(doc);
    });
    return filteredEvaluations;
}
