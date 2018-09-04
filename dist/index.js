"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const request = require("request-promise-native");
const fs = require("fs");
const datetime = require("node-datetime");
let settings = JSON.parse(fs.readFileSync('./settings.json').toString());
let transporter = nodemailer.createTransport({
    host: settings.mail.host,
    port: settings.mail.port,
    secure: settings.mail.secure,
    auth: {
        user: settings.mail.user,
        pass: settings.mail.password
    }
});
const mailOptions = {
    from: settings.mail.from,
    to: settings.emails_to_alert,
    subject: 'Alert fired - WEBSITE DOWN',
    text: 'The website ' + settings.url_to_lookup + ' went down at ',
    html: '<b>The website ' + settings.url_to_lookup + ' went down at '
};
setInterval(() => {
    request(settings.url_to_lookup)
        .then(data => {
        console.log("server contacted successfully");
    })
        .catch(data => {
        const dt = datetime.create().format('d/m/Y H:M:S');
        console.log('Service went down at: ' + dt);
        const newMailOptions = Object.assign({}, mailOptions);
        newMailOptions.text += dt;
        newMailOptions.html += dt + '</b>';
        transporter.sendMail(newMailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
        });
    });
}, settings.frequency * 1000);
