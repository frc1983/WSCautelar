const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Modality = require('../models/modality');
const Checklist = require('../models/checklist');
const ChecklistGroup = require('../models/checklistGroup');
const ChecklistItem = require('../models/checklistItem');
const ChecklistCondition = require('../models/checklistCondition');
const Picture = require('../models/picture');
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

router.post('/', async (req, res) => {
    var mod = req.body.modality;

    var modality = await Modality.find({ "number": mod.number })
        .populate('company')
        .then(async function (docs) {
            modality = docs.filter(function (doc) {
                return doc.company != null && doc.company.CNPJ == mod.company.CNPJ;
            });

            if (modality.length > 0)
                throw Error("Modalidade já cadastrada para a empresa");
            else {
                var newModality = await createModality(mod);
                var m = await Modality.create(newModality);
                return res.send({ modality: m });
            }
        })
        .catch(function (err) {
            return Logger(res, { error: err.message }, err);
        });
});

router.delete('/:CNPJ/:number', async (req, res) => {
    const { CNPJ, number } = req.params;

    try {
        Modality.find({ "number": number })
            .populate('company')
            .populate('pictures')
            .then(async function (docs) {
                modality = docs.filter(function (doc) {
                    return doc.company != null && doc.company.CNPJ == CNPJ;
                });

                if (modality.length === 0)
                    throw Error("Modalidade nao encontrada para a empresa");

                modality[0].pictures.forEach(picture => {
                    picture.remove();
                });

                var checklist = await Checklist.findById(modality[0].checklist._id).populate({
                    path: 'groups', populate: { path: 'itens', populate: { path: 'conditions' } }
                });
                checklist.groups.forEach(group => {
                    group.itens.forEach(item => {
                        item.conditions.forEach(condition => {
                            condition.remove();
                        });
                        item.remove();
                    });
                    group.remove();
                });
                checklist.remove();
                modality[0].remove();

                res.status(200).send();
            })
            .catch(function (err) {
                return Logger(res, { error: 'Modalidade nao encontrada' }, err);
            });
    } catch (err) {
        return Logger(res, { error: 'Erro ao remover MOdalidade' }, err);
    }
});

async function createModality(mod) {
    var newModality = new Modality(mod);

    var company = await validateCompany(mod.company);
    //Recria itens de checklist para salvar no banco
    var newArrayChecklist = validateChecklist(mod.checklist);

    newModality.company = company;
    newModality.pictures = insertPictures(mod.pictures);
    newModality.checklist = insertChecklist(newArrayChecklist);

    return newModality;
}

async function validateCompany(company) {
    if (company == null)
        throw Error('A Empresa não foi enviada');

    else if (!company.CNPJ)
        throw Error('O CNPJ da Empresa não foi enviado');

    var company = await Company.findOne({ "CNPJ": company.CNPJ });
    if (!company)
        throw Error('Empresa não cadastrada');

    return company;
}

function validateChecklist(checklist) {
    if (!checklist)
        throw Error("Checklist não foi enviado");
    else if (checklist) {
        if (!checklist.groups || checklist.groups.length == 0)
            throw Error("É necessário ao menos um grupo no checklist");

        checklist.groups.forEach(group => {
            if (!group.itens || group.itens.length == 0)
                throw Error("É necessário ao menos um item no grupo");

            group.itens.forEach(item => {
                if (!item.conditions || item.conditions.length == 0)
                    throw Error("É necessário ao menos um item no grupo");
            });
        });
    }

    return checklist;
}

function insertChecklist(checklist) {
    var retChecklist = new Checklist(checklist);
    retChecklist.groups = [];
    checklist.groups.forEach(group => {
        var g = new ChecklistGroup(group);
        g.itens = [];

        group.itens.forEach(item => {
            var i = new ChecklistItem(item);
            i.conditions = [];

            item.conditions.forEach(condition => {
                var c = new ChecklistCondition(condition);
                c.save();
                i.conditions.push(c);
            });

            i.save();
            i.markModified('conditions');
            g.itens.push(i);
        });

        g.save();
        g.markModified('itens');
        retChecklist.groups.push(g);
    });

    retChecklist.markModified('groups');
    retChecklist.save();

    return retChecklist;
}

function insertPictures(pictures) {
    var retPictures = [];
    pictures.forEach(picture => {
        var p = new Picture(picture)
        p.save();
        retPictures.push(p);
    });

    return retPictures;
}

function generateChecklist(qtd, modality) {

    for (let index = 1; index <= qtd; index++) {
        var p = new Picture();
        p.category = 'Foto ' + index;
        p.number = index;
        p.save();
        modality.pictures.push(p);
    }

    modality.checklist = new Checklist();
    modality.checklist.title = 'Checklist Veicular';
    modality.checklist.active = true;

    for (let index = 1; index <= qtd; index++) {
        var g = new ChecklistGroup();
        g.title = 'Grupo ' + index;
        g.number = index;

        for (let index = 1; index <= qtd; index++) {
            var i = new ChecklistItem();
            i.title = 'Item ' + index;
            i.number = index;

            for (let index = 1; index <= qtd; index++) {
                var c = new ChecklistCondition();
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