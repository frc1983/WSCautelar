const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Logger = require('../../modules/log');
const fs = require('fs');
const EvaluatedPicture = require('../models/evaluatedPicture');
const Picture = require('../models/picture');
const Evaluated = require('../models/evaluated');

const router = express.Router();
const uploadFolder = __dirname + '/../uploads/';

router.use(authMiddleware);

router.post('/', async (req, res) => {
    const { evaluatedId, pictureNumber } = req.body;

    try {
        await validatePictureSend(req, evaluatedId, pictureNumber)
            .then(async () => {
                saveEvaluatedPicture(true, req.files.file, evaluatedId, pictureNumber)
                    .then(async (savedImage) => {
                        await writeFile(req, savedImage, res);
                    }).catch((err) => {
                        return res.status(400).send({ error: err.message });
                    });
            }).catch((err) => {
                return res.status(400).send({ error: err.message });
            });
    } catch (err) {
        return Logger(res, { error: 'Erro ao salvar imagem' }, err.stack);
    };
});

router.put('/', async (req, res) => {
    const { evaluatedId, pictureNumber } = req.body;

    try {
        await validatePictureSend(req, evaluatedId, pictureNumber)
            .then(async () => {
                saveEvaluatedPicture(false, req.files.file, evaluatedId, pictureNumber)
                    .then(async (savedImage) => {
                        await writeFile(req, savedImage, res);
                    }).catch((err) => {
                        return res.status(400).send({ error: err.message });
                    });
            }).catch((err) => {
                return res.status(400).send({ error: err.message });
            });
    } catch (err) {
        return Logger(res, { error: 'Erro ao alterar imagem' }, err.stack);
    };
});

router.get('/:evaluatedId/:pictureId', async (req, res) => {
    const { evaluatedId, pictureId } = req.params;

    try {
        var evalPicture = await EvaluatedPicture.findOne({
            "evaluated": evaluatedId,
            "picture": pictureId
        });


        console.log('Upload', uploadFolder);
        console.log('eval', evalPicture);

        if (!evalPicture)
            return res.status(400).send({ error: 'Imagem da vistoria nao encontrada: ' + evaluatedId + ' --- ' + pictureId });

        var bitmap = fs.readFileSync(uploadFolder + evalPicture.path);
        //res.download(uploadFolder + evalPicture.path);
        res.status(200).send({ image: new Buffer(bitmap).toString('base64') });
    } catch (err) {
        return Logger(res, { error: 'Erro ao buscar Imagens' }, err.stack);
    };
});

async function writeFile(req, savedImage, res) {
    await req.files.file.mv(uploadFolder + savedImage.path, async function (err) {
        if (err)
            return Logger(res, { error: 'Erro ao enviar Imagem' }, err.stack);
        await EvaluatedPicture.findByIdAndUpdate(savedImage.id, savedImage);
        res.status(200).send();
    });
}

async function validatePictureSend(req, evaluatedId, pictureNumber) {
    if (!req.files)
        throw new Error('Nenhuma imagem enviada.');
    else if (!evaluatedId)
        throw new Error('Identificador de vistoria não enviado.');
    else if (!pictureNumber)
        throw new Error('Categoria de imagem não enviada.');
}

async function saveEvaluatedPicture(isNew, file, evaluatedId, pictureNumber) {
    var sendedFilename = file.name.split('.')[1];
    var eval = await Evaluated.findById(evaluatedId);
    var pic = await Picture.findOne({ number: pictureNumber });
    var filename = "";
    var imagePath = "";
    var savedImage = null;

    if (!isNew) {
        savedImage = await EvaluatedPicture.findOne({ evaluated: eval, picture: pic });
        if (!savedImage)
            throw new Error("Registro de imagem para atualização não encontrado");

        filename = savedImage.id + "." + sendedFilename;
        imagePath = getDatePath(eval) + filename;
    } else {
        var evaluatedPicture = new EvaluatedPicture();
        evaluatedPicture.evaluated = eval;
        evaluatedPicture.picture = pic;
        savedImage = await EvaluatedPicture.create(evaluatedPicture);
        filename = savedImage.id + "." + sendedFilename;
        imagePath = getDatePath(eval) + filename;
    }
    savedImage.markModified('path');
    savedImage.path = imagePath;

    return savedImage;
}

function getDatePath(evaluated) {
    createUploadsFolder(evaluated.evaluationDate);

    if (evaluated)
        return evaluated.evaluationDate.getFullYear() + "/" +
            (evaluated.evaluationDate.getMonth() + 1) + "/" +
            evaluated.evaluationDate.getDate() + "/";

    return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + "/";

    function createUploadsFolder(date) {
        var dirYear = uploadFolder + date.getFullYear();
        if (!fs.existsSync(dirYear)) {
            fs.mkdirSync(dirYear);
        }
        var dirMonth = dirYear + "/" + (date.getMonth() + 1);
        if (!fs.existsSync(dirMonth)) {
            fs.mkdirSync(dirMonth);
        }
        var dirDay = dirMonth + "/" + date.getDate();
        if (!fs.existsSync(dirDay)) {
            fs.mkdirSync(dirDay);
        }
    }
}

module.exports = app => app.use('/picture', router);