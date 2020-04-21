import * as fs from 'fs';


export interface SiteConfig {
    mailto: Array<string>;
    url: string;
    test: string,
    interval: number;
}
export interface Configuration {
    // Delay before each site check, used to offset/stagger requests (seconds)
    delay: number;
    logPath?: string;
    smtp: {
        // Connection URL
        url: string;
        // Connection username (e.g. if it can't be embedded in the connection url)
        username?: string;
        // Connection user password (e.g. if it can't be embedded in the connection url)
        password?: string;
    };
    from: string;
    sites: Array<SiteConfig>;
}

export class ConfigLoader {

    private configuration: Configuration | undefined;

    public constructor(
        private readonly filepath: string
    ) {}

    public getConfiguration(): Configuration {
        if (this.configuration === undefined) {
            this.configuration = this.fromFile();
        }
        return this.configuration;
    }

    private fromFile(): Configuration {
        const content: string = fs.readFileSync(this.filepath, 'utf8');
        return <Configuration> JSON.parse(content);
    }
    
    public getFromAddress(): string | undefined {
           if (process.env['FROM'] !== undefined) {
            return process.env['FROM'];
        }

        const conf = this.getConfiguration();
        if (conf.from !== undefined) {
            return conf.from;
        }

        return undefined;
    }

    public getSmtpConnectionUrl(): string {
        const url: URL = new URL(this.getSmtpUrl());

        const username: string | undefined = this.getSmtpUsername();
        if (username !== undefined) {
            url.username = encodeURIComponent(username);
        }

        const password: string | undefined = this.getSmtpPassword();
        if (password !== undefined) {
            url.password = encodeURIComponent(password);
        }

        return url.toString();
    }


    private getSmtpUsername(): string | undefined {
        if (process.env['SMTP_USERNAME'] !== undefined) {
            return process.env['SMTP_USERNAME'];
        }

        const smtpConf = this.getConfiguration().smtp;
        if (smtpConf.username !== undefined) {
            return smtpConf.username;
        }

        return undefined;
    }

    private getSmtpPassword(): string | undefined {
        if (process.env['SMTP_PASSWORD']) {
            return process.env['SMTP_PASSWORD'];
        }

        const smtpConf = this.getConfiguration().smtp;
        if (smtpConf.password !== undefined) {
            return smtpConf.password;
        }

        return undefined;
    }

    private getSmtpUrl(): string {
        const env: string | undefined = process.env['SMTP_URL'];
        if (env !== undefined) {
            return env;
        }

        return this.getConfiguration().smtp.url;
    }

}