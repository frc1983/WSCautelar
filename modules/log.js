const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const { mailLogTo, mailLogFrom } = require('../config/mail.json');

const sendLog = function sendLog(error){
    mailer.sendMail({
        to: mailLogTo,
        from: mailLogFrom,
        template: 'error/log',
        context: { error },
    }, (err) => {
        if(err)
            console.log('Nao foi possivel enviar o email de log');
    });
}

module.exports = sendLog;