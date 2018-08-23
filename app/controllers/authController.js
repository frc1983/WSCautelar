const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');
const authConfig = require('../../config/auth');
const User = require('../models/user');
const Company = require('../models/company');
const Logger = require('../../modules/log');

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 43200,
    });
}

router.post('/register', async (req, res) => {
    const { CPF, company } = req.body;

    try {
        var user = await User.findOne({ CPF });
        if (user)
            return res.status(400).send({ error: 'Usuário já cadastrado' });

        var companyFound = await Company.findOne({ "CNPJ": company.CNPJ });
        if (!companyFound)
            return res.status(400).send({ error: 'Empresa não cadastrada' });

        user = new User();
        user = req.body;
        user.company = companyFound;
        user = await User.create(user);
        user.password = undefined;

        res.send({
            user,
            token: generateToken({ id: user.id }),
        });
    } catch (err) {
        return Logger(res, { error: 'Erro de registro novo' }, err);
    }
});

router.put('/register', async (req, res) => {
    const { name, email, CPF, company, active } = req.body;

    try {
        if (!CPF)
            return res.status(400).send({ error: 'CPF de Usuário inválido' });

        var companyFound = await Company.findOne({ "CNPJ": company.CNPJ });
        if (!companyFound)
            return res.status(400).send({ error: 'Empresa não cadastrada' });

        var user = await User.findOne({ "CPF": CPF });
        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        user.name = name;
        user.email = email;
        user.active = active;
        user.company = companyFound;
        await User.updateOne({ "CPF": CPF }, user);
        user.password = undefined;

        res.send({
            user,
            token: generateToken({ id: user.id }),
        });
    } catch (err) {
        return Logger(res, { error: 'Erro de alteração de registro' }, err);
    }
});

router.post('/authenticate', async (req, res) => {
    const { CPF, password } = req.body;

    try {
        const user = await User.findOne({ CPF }).populate('company').select('+password');

        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        if (!await bcryptjs.compare(password, user.password))
            return res.status(400).send({ error: 'Senha inválida' });

        if (!user.active)
            return res.status(400).send({ error: 'Usuário inativo' });

        user.password = undefined;

        res.send({
            user,
            token: generateToken({ id: user.id }),
        });
    } catch (err) {
        return Logger(res, { error: 'Erro na autenticação' }, err);
    }
});

router.post('/forgot_password', async (req, res) => {
    const { cpf } = req.body;

    try {
        const user = await User.findOne({ cpf });

        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        });

        mailer.sendMail({
            to: user.email,
            from: 'fabiorochadacosta@gmail.com',
            template: 'auth/forgot_password',
            context: { token },
        }, (err) => {
            if (err)
                return res.status(400).send({ error: 'Nao foi possivel enviar o email de recuperacao' });

            return res.send();
        });
    } catch (err) {
        return Logger(res, { error: 'Erro no "Esqueci senha' }, err);
    }
});

router.post('/reset_password', async (req, res) => {
    const { cpf, token, password } = req.body;

    try {
        const user = await User.findOne({ cpf })
            .select('+passwordResetToken passwordResetExpires');

        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        if (token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Token invalido' });

        const now = new Date();
        if (now > user.passwordResetExpires)
            return res.status(400).send({ error: 'Token expirado' });

        user.password = password;

        await user.save();

        res.send();

    } catch (err) {
        return Logger(res, { error: 'Erro no envio da nova senha' }, err);
    }
});

module.exports = app => app.use('/auth', router);