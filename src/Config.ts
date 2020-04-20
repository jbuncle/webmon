import {MailSettings} from "./Mailer";
import * as fs from 'fs';

export interface Configuration {
    logPath?: string,
    mailSettings: MailSettings;
    sites: Array<{
        mailto: Array<string>;
        url: string;
        test: string,
        interval: number;
    }>;
}

export class ConfigLoader {

    public constructor(
        private readonly filepath: string
    ) {}

    public getConfiguration(): Configuration {
        const content: string = fs.readFileSync(this.filepath, 'utf8');
        return <Configuration> JSON.parse(content);
    }
}