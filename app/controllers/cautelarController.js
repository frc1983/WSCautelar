const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Logger = require('../../modules/log');

const router = express.Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
    res.send({ ok: true });
});

module.exports = app => app.use('/cautelar', router);