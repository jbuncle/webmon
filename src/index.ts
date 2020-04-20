/**
 * @copyright 2019 James Buncle <jbuncle@hotmail.com>
 */
import {HttpRequester} from './HttpRequester';
import {SiteJob, SiteJobResult} from './SiteJob';
import {Logger} from './Logger';
import {parse} from 'url';

const url = 'https://www.google.co.uk';

const hostname: string | null = parse(url).hostname;
if (hostname === null) {
    throw new Error(`Failed to get hostname from url '${url}'`);
}
const siteChecker: HttpRequester = new HttpRequester(url);
const regex: RegExp = /Google Search/gm;


const logger: Logger = new Logger('./', hostname);
const siteJob = new SiteJob('*/5 * * * * *', siteChecker, regex);
siteJob.run((result: SiteJobResult) => {
    logger.appendLine(result);
    console.log(result);
});