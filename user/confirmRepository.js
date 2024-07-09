const nodemailer = require('nodemailer');


class confirmRepository {

    static async send() {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: '',
                pass: ''
            }
        });

        var mailOptions = {
            from: 'tomasmaldocena@gmail.com',
            to: 'tomas.bautista.maldocena@gmail.com',
            subject: 'Sending Email using Node.js',
            text: 'That was easy!'
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}

module.exports = confirmRepository