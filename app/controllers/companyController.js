const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Company = require('../models/company');

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
        return res.status(400).send({ error: 'Erro de registro' });
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
        return res.status(400).send({ error: 'Erro de registro' });
    }
});

module.exports = app => app.use('/company', router);