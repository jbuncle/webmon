import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import * as zlib from 'zlib';


export enum Protocol {
    HTTP = 'http',
    HTTPS = 'https',
}
export interface RequestOptions {
    uri: string,
    method: string,
    timeout: number,
    headers: NodeJS.Dict<number | string | string[]>;
}
export interface HTTPResponse {
    uri: string,
    statusCode: number;
    statusMessage: string;
    headers: NodeJS.Dict<number | string | string[]>;
    body: string;
    'content-encoding': string | undefined;
}
export class HTTPRequest {
    public static fetch(requestOptions: RequestOptions): Promise<HTTPResponse> {
        const parsed: url.UrlWithStringQuery = url.parse(requestOptions.uri);
        const options: http.RequestOptions = {
            protocol: parsed.protocol,
            host: parsed.host,
            port: parsed.port,
            path: parsed.path,
            hostname: parsed.hostname,
            method: requestOptions.method,
            timeout: requestOptions.timeout,
            headers: requestOptions.headers,
        };
        // return new pending promise
        return new Promise((resolve, reject) => {
            const responseHandler = (response: http.IncomingMessage) => {


                // temporary data holder
                const buffers: Array<Buffer> = [];
                // on every content chunk, push it to the data array
                response.on('data', (chunk) => {
                    buffers.push(Buffer.from(chunk));
                });
                // we are done, resolve promise with those joined chunks
                response.on('end', () => {

                    if (response.statusCode === undefined) {
                        throw new Error("Response status code not defined");
                    }
                    if (response.statusMessage === undefined) {
                        throw new Error("Response status message not defined");
                    }

                    let compression: string | undefined;
                    // Handle compressed data
                    let buffer: Buffer = Buffer.concat(buffers);
                    if (response.headers['content-encoding'] === 'gzip') {
                        buffer = zlib.gunzipSync(buffer);
                        compression = response.headers['content-encoding'];
                    }

                    const charset: string | undefined = this.extractCharset(response.headers['content-type']);

                    let contentEncoding: string;
                    switch (charset) {
                        case 'UTF-8':
                            contentEncoding = 'UTF-8';
                            break;
                        case 'ISO-8859-1':
                        case 'latin1':
                            contentEncoding = 'latin1';
                            break;

                        case '':
                        case undefined:
                            // Charset not defined - We should try and work it out, but for now assume UTF-8
                            contentEncoding = 'UTF-8';
                            break;
                            
                        default:
                            contentEncoding = charset;
                    }

                    const responseObj: HTTPResponse = {
                        uri: requestOptions.uri,
                        headers: response.headers,
                        statusCode: response.statusCode,
                        statusMessage: response.statusMessage,
                        body: buffer.toString(contentEncoding),
                        'content-encoding': response.headers['content-encoding'],
                    };
                    resolve(responseObj);
                });
            };

            let request: http.ClientRequest;
            if (options.protocol === 'https:') {
                request = https.get(options, responseHandler);
            } else {
                request = http.get(options, responseHandler);
            }
            // handle connection errors of the request
            request.on('error', (err: Error) => {
                reject(err);
            })
        })
    };

    private static extractCharset(contentType?: string): string | undefined {
        if (contentType === undefined) {
            return undefined;
        }
        const regex = /charset=([A-z0-9-]+)(;|$)/;
        const matches: RegExpExecArray | null = regex.exec(contentType);
        if (matches !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (matches.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            return matches[1];
        }
        return undefined;
    }
}