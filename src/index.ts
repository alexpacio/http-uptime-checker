import * as nodemailer from 'nodemailer';
import * as request from 'request-promise-native';
import * as fs from 'fs';
import * as datetime from 'node-datetime';

let settings = JSON.parse(fs.readFileSync('./settings.json').toString())

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: settings.mail.host,
    port: settings.mail.port,
    secure: settings.mail.secure, // true for 465, false for other ports
    auth: {
        user: settings.mail.user,
        pass: settings.mail.password
    }
});
const mailOptions = {
    from: settings.mail.from, // sender address
    to: settings.emails_to_alert, // list of receivers
    subject: 'Alert fired - WEBSITE DOWN', // Subject line
    text: 'The website ' + settings.url_to_lookup + ' went down at ', // plain text body
    html: '<b>The website ' + settings.url_to_lookup + ' went down at ' // html body
};

setInterval(() => {
    request(settings.url_to_lookup)
        .then(data => {
            console.log("server contacted successfully")
        })
        .catch(data => {
            const dt = datetime.create().format('d/m/Y H:M:S');
            console.log('Service went down at: ' + dt)
            const newMailOptions = Object.assign({}, mailOptions);
            newMailOptions.text += dt;
            newMailOptions.html += dt + '</b>'
            transporter.sendMail(newMailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
            });
        })
}, settings.frequency * 1000)



