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
        return new Date().toISOString().split('T', 1).pop();
    }
}