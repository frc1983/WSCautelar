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
        return Logger(res, { error: 'Erro ao salvar imagem' }, err);
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
        return Logger(res, { error: 'Erro ao alterar imagem' }, err);
    };
});

router.get('/:evaluatedId/:pictureId', async (req, res) => {
    const { evaluatedId, pictureId } = req.params;

    try {
        var evalPicture = await EvaluatedPicture.findOne({
            "evaluated": evaluatedId,
            "picture": pictureId
        });

        var bitmap = fs.readFileSync(uploadFolder + evalPicture.path);
        //res.download(uploadFolder + evalPicture.path);
        res.status(200).send({ image: new Buffer(bitmap).toString('base64') });
    } catch (err) {
        return Logger(res, { error: 'Erro ao buscar Imagens' }, err);
    };
});

async function writeFile(req, savedImage, res) {
    await req.files.file.mv(uploadFolder + savedImage.path, async function (err) {
        if (err)
            return Logger(res, { error: 'Erro ao enviar Imagem' }, err);
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
    let date = createUploadsFolder();

    if (evaluated)
        return evaluated.evaluationDate.getFullYear() + "/" +
            evaluated.evaluationDate.getMonth() + "/" +
            evaluated.evaluationDate.getDay() + "/";

    return date.getFullYear() + "/" + date.getMonth() + "/" + date.getDay() + "/";

    function createUploadsFolder() {
        let date = new Date();
        var dirYear = uploadFolder + "/" + date.getFullYear();
        if (!fs.existsSync(dirYear)) {
            fs.mkdirSync(dirYear);
        }
        var dirMonth = dirYear + "/" + date.getMonth();
        if (!fs.existsSync(dirMonth)) {
            fs.mkdirSync(dirMonth);
        }
        var dirDay = dirMonth + "/" + date.getDay();
        if (!fs.existsSync(dirDay)) {
            fs.mkdirSync(dirDay);
        }
        return date;
    }
}

module.exports = app => app.use('/picture', router);