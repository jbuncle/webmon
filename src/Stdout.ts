export class Stdout {

    private buffered: number = 0;

    public constructor(
        private readonly lineLength: number
    ) {
    }

    public writeLn(line: string): void {
        process.stdout.write(`${line}\n`);
        this.buffered = 0;
    }
    
    public write(str: string): void {
        for (let i = 0; i < str.length; i++) {
            this.writeChar(str.charAt(i));
        }
    }

    private writeChar(str: string): void {
        process.stdout.write(str);

        if (str === "\n") {
            this.buffered = 0;
        } else {
            this.buffered++;
        }
        if (this.buffered > this.lineLength) {
            // Clear
            this.buffered = 0;
            process.stdout.write("\n");
        }
    }
}