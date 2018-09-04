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
    const dt = datetime.create().format('d/m/Y H:M:S');
    request(settings.url_to_lookup)
        .then(() => {
        if (failuresCounter > 3 && successesCounter <= 3) {
            successesCounter++;
        }
        else if (failuresCounter > 3 && successesCounter > 3) {
            failuresCounter = 0;
            windowsLog.warn('Service came up again at: ' + dt);
            const newMailOptions = Object.assign({}, mailOptions);
            newMailOptions.subject = 'The website ' + settings.url_to_lookup + ' is back online again';
            newMailOptions.text = 'The website ' + settings.url_to_lookup + ' came online at ' + dt;
            newMailOptions.html = '<b>The website ' + settings.url_to_lookup + ' came online at ' + dt + '</b>';
            transporter.sendMail(newMailOptions, (error, info) => {
                if (error) {
                    windowsLog.error(error.message);
                }
            });
        }
    })
        .catch(() => {
        failuresCounter++;
        if (failuresCounter <= 3) {
            windowsLog.warn('Service went down at: ' + dt);
            const newMailOptions = Object.assign({}, mailOptions);
            newMailOptions.text += dt;
            newMailOptions.html += dt + '</b>';
            transporter.sendMail(newMailOptions, (error, info) => {
                if (error) {
                    windowsLog.error(error.message);
                }
            });
        }
    });
}, settings.frequency * 1000);
