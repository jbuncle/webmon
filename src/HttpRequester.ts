import * as RequestPromise from "request-promise-native";
import {FullResponse, OptionsWithUri} from 'request-promise-native'
import {RequestError} from 'request-promise-native/errors'


interface HttpResponseBase {
    url: string;
    duration: number;
    time: number;
}
export interface HttpResponse extends HttpResponseBase {
    statusCode: number;
    message: string;
    body: string;
}
export interface HttpRequestError extends HttpResponseBase {
    error: string;
}

/**
 * Class which essentially just performs HTTP Request and returns the response in a friendly format.
 */
export class HttpRequester {


    public constructor(
        private readonly url: string,
        private readonly timeout: number = 60,
        private readonly userAgent: string = 'SiteChecker Bot',
    ) {

    }

    public checkSite(callback: (result: HttpResponse | HttpRequestError) => void): void {
        const options: OptionsWithUri = {
            method: 'GET',
            uri: this.url,
            headers: {
                'User-Agent': this.userAgent
            },
            resolveWithFullResponse: true,
            // Long timeout will tell us more about the connection
            timeout: this.timeout * 1000,
            followAllRedirects: true,
            strictSSL: true,
        };

        const startTime: number = this.time();
        RequestPromise(options).then((value: FullResponse): void => {
            const statusCode: number = value.statusCode;
            const message: string = value.statusMessage;
            const body: string = value.body;
            const duration: number = this.time() - startTime;

            const response: HttpResponse = {
                url: this.url,
                statusCode,
                message,
                body,
                duration,
                time: startTime,
            };
            callback(response);
        }).catch((error: RequestError): void => {
            const duration: number = this.time() - startTime;
            const response: HttpRequestError = {
                url: this.url,
                error: error.message,
                duration,
                time: startTime,
            };
            callback(response);
        });
    }


    /**
     * Get current time in milliseconds.
     */
    private time(): number {

        return new Date().getTime();
    }
}