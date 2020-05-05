import {createTransport} from 'nodemailer';
import Mail = require('nodemailer/lib/mailer');


export interface Message {
    from?: string;
    to: Array<string>;
    subject: string;
    text: string;
}


export class Mailer {

    public constructor(
        private readonly connectionUrl: string
    ) {}

    public test() {
        this.createTransporter().verify(function (error, success) {
            if (error) {
                throw new Error(`Mail verification failed '${error.message}'`);
            }
        });
    }

    private createTransporter(): Mail {
        return createTransport(this.connectionUrl);
    }

    public sendMail(message: Message) {

        const mailOptions: Mail.Options = {
            from: message.from,
            to: message.to,
            subject: message.subject,
            text: message.text
        };

        this.sendMailPromise(mailOptions)
            .catch((error: Error) => {
                console.error(`Failed to send mail due to '${error.message}'`);
            });
    }


    public sendMailPromise(mailOptions: Mail.Options): Promise<any> {
        return new Promise((resolve: (value?: void | PromiseLike<void> | undefined) => void, reject: (reason?: any) => void) => {
            this.createTransporter().sendMail(mailOptions, function (error: Error | null, info: any) {
                if (error) {
                    // Don't kill entire process if mail is undeliverable.
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        });
    }
}
