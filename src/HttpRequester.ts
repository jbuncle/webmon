import {HTTPRequest, HTTPResponse} from "./HTTPRequest";

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
        const options = {
            method: 'GET',
            uri: this.url,
            headers: {
                'user-agent': this.userAgent,
            },
            // Long timeout will tell us more about the connection
            timeout: this.timeout * 1000,
        };

        const startTime: number = this.time();
        HTTPRequest.fetch(options).then((fullResponse: HTTPResponse): void => {
            const statusCode: number = fullResponse.statusCode;
            const message: string = fullResponse.statusMessage;
            const body: string = fullResponse.body;
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
        }).catch((error: Error): void => {
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