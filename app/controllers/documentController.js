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

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        if (!id)
            res.status(400).send({ error: "O identificador da vistoria deve ser preenchido" });

        await findEvaluated(id).then(doc => {
            res.status(200).send({ document: doc });           
        }).catch(err => {
            res.status(400).send({ error: err });
        });
    } catch (err) {
        return Logger(res, { error: 'Erro ao buscar Vistorias' }, err.stack);
    };
});


module.exports = app => app.use('/document', router);

async function findEvaluated(id) {
    return new Promise(async function (resolve, reject) {
        await Evaluated.findById(id)
            .populate('company')
            .populate('vehicle')
            .populate('user')
            .populate('modality')
            .exec(function (err, doc) {
                if (err)
                    reject('Erro ao buscar a vistoria');

                resolve(doc);
            });
    });
}

