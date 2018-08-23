const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Company = require('../models/company');
const Logger = require('../../modules/log');

const router = express.Router();

router.use(authMiddleware);

router.get('/:cnpj?', async (req, res) => {
    var findParam = {};
    if (req.params.cnpj != undefined)
        findParam = { "CNPJ": req.params.cnpj };

    try {
        var companies = await Company.find(findParam);

        res.send({ companies });
    } catch (err) {
        return Logger(res, { error: 'Erro na consulta de Empresa' }, err);
    }
});

router.post('/', async (req, res) => {
    const { CNPJ } = req.body;

    try {
        if (await Company.findOne({ CNPJ }))
            return res.status(400).send({ error: 'Empresa já cadastrada' });

        const company = await Company.create(req.body);

        res.send({ company });
    } catch (err) {
        return Logger(res, { error: 'Erro no cadastro de Empresa' }, err);
    }
});

router.put('/', async (req, res) => {
    const { CNPJ, name, email } = req.body;

    try {
        var findCompany = await Company.findOne({ CNPJ });
        if (!findCompany)
            return res.status(400).send({ error: 'Empresa não cadastrada' });

        findCompany.email = email;
        findCompany.name = name;
        await Company.updateOne(findCompany);

        res.send({ findCompany });
    } catch (err) {
        return Logger(res, { error: 'Erro na atualização de Empresa' }, err);
    }
});

module.exports = app => app.use('/company', router);