const express = require('express');
const jsreport = require('jsreport');
const authMiddleware = require('../middlewares/auth');
const Logger = require('../../modules/log');
const Modality = require('../models/modality');
const Vehicle = require('../models/vehicle');
const Company = require('../models/company');
const User = require('../models/user');
const Evaluated = require('../models/evaluated');

const router = express.Router();

router.use(authMiddleware);

require('jsreport')({ httpPort: 3000, httpsPort: 0 }).init();

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        if (!id)
            res.status(400).send({ error: "O identificador da vistoria deve ser preenchido" });

        await findEvaluated(id).then(doc => {
            //res.status(200).send({ document: doc });

            jsreport.render({
                template: {
                    content: '<h1>Hello {{foo}}</h1>',
                    engine: 'ejs',
                    recipe: 'chrome-pdf'
                },
                data: {
                    foo: "world"
                }
            }).then((resp) => {
                // write report buffer to a file
                fs.writeFileSync('report.pdf', resp.content)
            }).catch(err => {
                res.status(400).send({ error: err });
            });
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

