"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const request = require("request-promise-native");
const fs = require("fs");
const datetime = require("node-datetime");
const node_windows_1 = require("node-windows");
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
let failuresCounter = 0;
let successesCounter = 0;
let windowsLog = new node_windows_1.EventLogger('Http Uptime Checker');
setInterval(() => {
    request(settings.url_to_lookup)
        .then(() => {
        if (failuresCounter > 3 && successesCounter <= 3) {
            successesCounter++;
        }
        else if (failuresCounter > 3 && successesCounter > 3) {
            failuresCounter = 0;
        }
    })
        .catch(() => {
        failuresCounter++;
        const dt = datetime.create().format('d/m/Y H:M:S');
        if (failuresCounter <= 3) {
            windowsLog.warn('Service went down at: ' + dt);
            const newMailOptions = Object.assign({}, mailOptions);
            newMailOptions.text += dt;
            newMailOptions.html += dt + '</b>';
            transporter.sendMail(newMailOptions, (error, info) => {
                if (error) {
                    windowsLog.error(error);
                }
            });
        }
    });
}, settings.frequency * 1000);
