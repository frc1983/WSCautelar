const mailer = require('../../modules/mailer');

const { mailLogTo, mailLogFrom } = require('../config/mail.json');

const Logger = function sendLog(res, error, err){
    mailer.sendMail({
        to: mailLogTo,
        from: mailLogFrom,
        template: 'error/log',
        context: { error, err },
    }, (err) => {
        if(err){
            console.log('Nao foi possivel enviar o email de log');
            return res.status(400).send(error);
        }
    });

    return res.status(400).send(error);
}

module.exports = Logger;