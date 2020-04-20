import * as fs from 'fs';
import * as path from 'path';

export class Logger {

    public constructor(
        private readonly filepath: string,
        private readonly prefix: string = 'sitecheck'
    ) {

    }

    public appendLine(data: any): void {
        const dataString: string = JSON.stringify(data) + "\n";
        fs.appendFile(this.getAbsoluteFilepath(), dataString, function (err) {
            if (err) {
                throw err;
            };
        });

    }

    private getAbsoluteFilepath(): string {
        return path.join(this.filepath, this.prefix + '-' + this.getDateString() + '.log');
    }

    private getDateString(): string {
        const isoString: string = new Date().toISOString();
        const parts = isoString.split('T', 1);
        const date: string | undefined = parts.pop();
        if (date === undefined) {
            throw new Error("Failed to determine date");
        }
        return date;
    }
}