/**
 * @copyright 2019 James Buncle <jbuncle@hotmail.com>
 */
import {HttpRequester} from './HttpRequester';
import {SiteJob, SiteJobResult} from './SiteJob';
import {Logger} from './Logger';
import {parse} from 'url';
import {ConfigLoader, Configuration} from './Config';
import {Mailer} from './Mailer';
import {Scheduler} from './Scheduler';


const conffile: string = process.argv[2];
const configLoader: ConfigLoader = new ConfigLoader(conffile);
const configuration: Configuration = configLoader.getConfiguration();
const scheduler: Scheduler = new Scheduler(configuration.delay);

const smtpConnectionUrl: string = configLoader.getSmtpConnectionUrl();
const mailer: Mailer = new Mailer(smtpConnectionUrl);
const fromAddress: string | undefined = configLoader.getFromAddress();
mailer.test();


const logPath: string = (configuration.logPath) ? configuration.logPath : '/var/log/webmon';
for (const site of configuration.sites) {
    const json: string = JSON.stringify(site);
    process.stdout.write(`Adding site '${json}' \n`);

    const url: string = site.url;
    const test: string = site.test;

    const hostname: string | null = parse(url).hostname;
    if (hostname === null) {
        throw new Error(`Failed to get hostname from url '${url}'`);
    }

    const siteChecker: HttpRequester = new HttpRequester(url);
    const regex: RegExp = new RegExp(test);

    const logger: Logger = new Logger(logPath, hostname);
    const siteJob: SiteJob = new SiteJob(siteChecker, regex);

    scheduler.add(site.interval, () => {

        siteJob.run((result: SiteJobResult) => {

            // Indicate job ran
            logger.appendLine(result);

            if (!result.success) {
                process.stdout.write('x');

                mailer.sendMail({
                    from: fromAddress,
                    to: site.mailto,
                    subject: `Site check failed for ${site.url}`,
                    text: JSON.stringify(result)
                });
            } else {
                process.stdout.write('.');

            }
        });
    });


}

process.stdout.write(`Starting `);
scheduler.start();

