const express = require('express');
const fs = require('fs');
const authMiddleware = require('../middlewares/auth');
const Logger = require('../../modules/log');
const Modality = require('../models/modality');
const Vehicle = require('../models/vehicle');
const Company = require('../models/company');
const User = require('../models/user');
const Evaluated = require('../models/evaluated');

const router = express.Router();

//router.use(authMiddleware);

const uploadFolder = __dirname + '/../uploads/';
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        if (!id)
            res.status(400).send({ error: "O identificador da vistoria deve ser preenchido" });

        //printPage();
        await findEvaluated(id).then(doc => {
            res.render('warranty.html', { info: doc });
            //res.status(200).send({ document: doc });
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

function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}


function printPage() {
    const puppeteer = require('puppeteer');

    (async () => {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        //var img = 'data:image/jpeg;base64,' + base64_encode(uploadFolder + '2018/8/21/5b88622cafa5399dc0d256bd.jpg');
        //const test_html = '<html><h3>Hello world!</h3><img src="' + img + '"></html>';
        await page.goto('http://localhost:8080/document/5b892001252c9e43246cd52f', { waitUntil: 'networkidle0' });
        await page.pdf({
            path: 'app/uploads/test-puppeteer.pdf',
            format: 'A4',
            margin: { top: '0.5cm', right: '1cm', bottom: '0.8cm', left: '1cm' }, printBackground: true
        });
        await browser.close();
    })();
}
