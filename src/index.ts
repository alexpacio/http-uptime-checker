import * as nodemailer from 'nodemailer';
import * as request from 'request';
import * as fs from 'fs';
import * as datetime from 'node-datetime';

let settings = JSON.parse(fs.readFileSync('../settings.json').toString())

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
let mailOptions = {
    from: settings.mail.from, // sender address
    to: settings.emails_to_alert, // list of receivers
    subject: 'Alert fired - WEBSITE DOWN', // Subject line
    text: 'The website ' + settings.url_to_lookup + ' went down at ', // plain text body
    html: '<b>The website ' + settings.url_to_lookup + ' went down at ' // html body
};


setTimeout(request.get(settings.url_to_lookup).on('response', response => {
    if (response.statusCode !== 200) {
        let dt = datetime.create().format('d/m/Y H:M:S');
        console.log('Service went down at: ' + dt)
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            mailOptions.text += dt;
            mailOptions.html += dt + '</b>'
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    }
}), settings.frequency * 1000)

