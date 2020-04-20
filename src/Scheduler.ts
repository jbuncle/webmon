interface ToSchedule {
    interval: number;
    task: () => void;
}

export class Scheduler {

    private readonly toSchedule: Array<ToSchedule> = new Array<ToSchedule>();

    private timeout: NodeJS.Timeout | undefined;
    private readonly tasks: Array<NodeJS.Timeout> = new Array<NodeJS.Timeout>();

    public constructor(
        private readonly offsetSeconds: number
    ) {}


    private startInterval(intervalSeconds: number, task: () => void) {
        const millisecondsInterval: number = intervalSeconds * 1000;

        console.log(`Starting interval of ${millisecondsInterval}ms`);
        // Run first immediately
        task();
        const interval: NodeJS.Timeout = setInterval(function () {
            console.log('Running task');
            task();
        }, millisecondsInterval);

        this.tasks.push(interval);
    }

    public add(interval: number, task: () => void) {
        this.toSchedule.push({
            interval,
            task,
        });
    }

    public start(): void {
        console.log("Starting");
        this.scheduleNext();
    }

    private scheduleNext(): void {
        if (this.timeout) {
            throw new Error("Already scheduling");
        }

        const next: ToSchedule | undefined = this.toSchedule.shift();

        if (next !== undefined) {
            // Run immediately
            this.startInterval(next.interval, next.task);

            // Adding next schedule in 
            const delayMillis: number = this.offsetSeconds * 1000;
            console.log(`Setting up next schedule in ${delayMillis}ms`);
            // Set up next after delay
            this.timeout = setTimeout(() => {
                this.timeout = undefined;

                this.scheduleNext();
            }, delayMillis)
        }
    }

    public kill(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        for (const tasks of this.tasks) {
            clearInterval(tasks);
        }
    }

}