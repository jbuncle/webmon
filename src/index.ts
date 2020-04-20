/**
 * @copyright 2019 James Buncle <jbuncle@hotmail.com>
 */
import {HttpRequester} from './HttpRequester';
import {SiteJob, SiteJobResult} from './SiteJob';
import {Logger} from './Logger';
import {parse} from 'url';
import {ConfigLoader, Configuration} from './Config';
import {MailSettings, Mailer} from './Mailer';
import {Scheduler} from './Scheduler';


const conffile: string = process.argv[2];
const configLoader: ConfigLoader = new ConfigLoader(conffile);
const configuration: Configuration = configLoader.getConfiguration();
const scheduler: Scheduler = new Scheduler(10);


const mailSettings: MailSettings = configuration.mailSettings;
const mailer: Mailer = new Mailer(mailSettings);
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
            process.stdout.write('.');
            logger.appendLine(result);

            if (!result.success) {

                mailer.sendMail({
                    to: site.mailto,
                    subject: `Site check failed for ${site.url}`,
                    text: JSON.stringify(result)
                });
            }
        });
    });


}

process.stdout.write(`Starting `);
scheduler.start();

