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
        private readonly siteChecker: HttpRequester,
        private readonly regex: RegExp,
    ) {

    }

    public run(callback: (result: SiteJobResult) => void): void {

        this.siteChecker.checkSite((result: HttpResponse | HttpRequestError): void => {
            if ('statusCode' in result) {
                const httpResponse: HttpResponse = result;

                const statusCode: number = httpResponse.statusCode;
                let message: string = httpResponse.message;
                const url: string = httpResponse.url;
                const duration: number = httpResponse.duration;
                const timestamp: number = httpResponse.time;

                let passedTest: boolean;
                if (statusCode !== 200) {
                    passedTest = false;
                } else {
                    const bodyString = httpResponse.body;
                    const matches: RegExpExecArray | null = this.regex.exec(bodyString);
                    passedTest = matches !== null && matches.length > 0;
                    if (passedTest === false) {
                        message = 'Failed to match response to ' + this.regex.source;
                    }
                }

                callback({
                    url,
                    statusCode,
                    message,
                    success: passedTest,
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

    }
}