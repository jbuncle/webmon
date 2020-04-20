
import {CronJob} from 'cron';
import {HttpRequester, HttpResponse, HttpRequestError} from './HttpRequester';


export interface SiteJobResult {
    url: string;
    statusCode?: number;
    message: string;
    success: boolean;
    duration: number;
    timestamp: number;
}

export class SiteJob {
    public constructor(
        private readonly cron: string,
        private readonly siteChecker: HttpRequester,
        private readonly regex: RegExp,
    ) {

    }

    public run(callback: (result: SiteJobResult) => void): void {

        const job = new CronJob(this.cron, (): void => {

            this.siteChecker.checkSite((result: HttpResponse | HttpRequestError): void => {
                if ('statusCode' in result) {
                    const httpResponse: HttpResponse = result;

                    const statusCode: number = httpResponse.statusCode;
                    let message: string = httpResponse.message;
                    const url: string = httpResponse.url;
                    const duration: number = httpResponse.duration;
                    const timestamp: number = httpResponse.time;
                    const matches: boolean = this.regex.test(httpResponse.body);
                    if (matches === false) {
                        message = 'Failed to match response to ' + this.regex.source;
                    }
                    callback({
                        url,
                        statusCode,
                        message,
                        success: matches,
                        duration,
                        timestamp,
                    });
                } else {
                    callback({
                        url: result.url,
                        message: result.error,
                        success: false,
                        duration: result.duration,
                        timestamp: result.time,
                    });
                }
            });

        });
        job.start();
    }
}