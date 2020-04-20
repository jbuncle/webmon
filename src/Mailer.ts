import {createTransport} from 'nodemailer';
import SMTPTransport = require('nodemailer/lib/smtp-transport');
import Mail = require('nodemailer/lib/mailer');

export interface MailSettings {
    from: string,
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
}

export interface Message {
    to: Array<string>;
    subject: string;
    text: string;
}


export class Mailer {

    public constructor(
        private readonly mailSettings: MailSettings
    ) {}

    public test() {
        this.createTransporter().verify(function (error, success) {
            if (error) {
                throw new Error(`Mail verification failed '${error.message}'`);
            }
        });

    }

    private createTransporter(): Mail {
        const options: SMTPTransport.Options = {
            host: this.mailSettings.host,
            port: this.mailSettings.port,
            secure: this.mailSettings.secure,
            auth: {
                user: this.mailSettings.user,
                pass: this.mailSettings.password
            },
        };

        return createTransport(options);
    }

    public sendMail(message: Message) {

        const mailOptions: Mail.Options = {
            from: this.mailSettings.from,
            to: message.to,
            subject: message.subject,
            text: message.text
        };

        this.createTransporter().sendMail(mailOptions, function (error: Error | null, info: any) {
            if (error) {
                throw new Error(`Failed to send mail due to '${error.message}'`);
            }
        });
    }
}
