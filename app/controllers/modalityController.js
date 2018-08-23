const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Modality = require('../models/modality');
const Checklist = require('../models/checklist');
const ChecklistGroups = require('../models/checklistGroups');
const ChecklistItens = require('../models/checklistItens');
const ChecklistConditions = require('../models/checklistConditions');
const Pictures = require('../models/pictures');
const Company = require('../models/company');
const Logger = require('../../modules/log');

const router = express.Router();

router.use(authMiddleware);

router.get('/insert', async (req, res) => {
    var defaultChecklist = new Modality();
    defaultChecklist.name = 'Veicular';
    defaultChecklist.number = 1;
    defaultChecklist.checklist = generateChecklist(10, defaultChecklist);
    defaultChecklist.company = await Company.findOne().sort("_id");

    defaultChecklist.save(function (err) {
        if (err) {
            return res.status(400).send({ error: 'Erro ao salvar Modalidade padrao' });
        }

        res.send({ modality: defaultChecklist });
    });
});

router.get('/:cnpj?', async (req, res) => {
    try {
        var CNPJ = undefined;
        if (req.params.cnpj != undefined)
            CNPJ = req.params.cnpj;

        var modalities = await Modality.find()
            .populate('company')
            .populate('pictures')
            .populate({
                path: 'checklist',
                populate: { path: 'groups', populate: { path: 'itens', populate: { path: 'conditions' } } }
            }).exec(function (err, docs) {
                modalities = docs.filter(function (doc) {
                    return doc.company != null && (CNPJ === undefined || doc.company.CNPJ == CNPJ);
                });

                if (!modalities)
                    return res.status(400).send({ error: 'Nenhuma modalidade encontrada' });

                res.send({ modalities: modalities });
            });
    } catch (err) {
        return Logger(res, { error: 'Erro ao buscar Modalidades' }, err);
    };
});

function generateChecklist(qtd, modality) {

    for (let index = 1; index <= qtd; index++) {
        var p = new Pictures();
        p.category = 'Foto ' + index;
        p.number = index;
        p.save();
        modality.pictures.push(p);
    }

    modality.checklist = new Checklist();
    modality.checklist.name = 'Checklist Veicular';
    modality.checklist.active = true;

    for (let index = 1; index <= qtd; index++) {
        var g = new ChecklistGroups();
        g.title = 'Grupo ' + index;
        g.number = index;

        for (let index = 1; index <= qtd; index++) {
            var i = new ChecklistItens();
            i.title = 'Item ' + index;
            i.number = index;

            for (let index = 1; index <= qtd; index++) {
                var c = new ChecklistConditions();
                c.number = index;
                c.title = 'Condicao ' + index;
                c.save();
                i.conditions.push(c);
            }
            i.save();
            i.markModified('conditions');
            g.itens.push(i);
        }
        g.save();
        g.markModified('itens');
        modality.checklist.groups.push(g);
    }

    modality.markModified('pictures');
    modality.checklist.markModified('groups');
    modality.checklist.save();

    return modality.checklist;
}

module.exports = app => app.use('/modality', router);