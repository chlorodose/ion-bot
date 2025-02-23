import { SourceMapConsumer } from "source-map";

export class ErrorMapper {
    private _consumer?: SourceMapConsumer;
    private get consumer(): SourceMapConsumer {
        if (this._consumer == null) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            this._consumer = new SourceMapConsumer(require("main.js.map"));
        }
        return this._consumer;
    }
    private cache: Map<Error, string> = new Map();
    mapError(error: Error): string {
        if (this.cache.has(error)) {
            return this.cache.get(error)!;
        }
        const stack = error.stack!;
        // eslint-disable-next-line no-useless-escape
        const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm;
        let match: RegExpExecArray | null;
        let outStack = error.toString();

        while ((match = re.exec(stack))) {
            if (match[2] === "main") {
                const pos = this.consumer.originalPositionFor({
                    column: parseInt(match[4], 10),
                    line: parseInt(match[3], 10)
                });

                if (pos.line != null) {
                    if (pos.name) {
                        outStack += `\n    at ${pos.name} (${pos.source}:${pos.line}:${pos.column})`;
                    } else {
                        if (match[1]) {
                            // no original source file name known - use file name from given trace
                            outStack += `\n    at ${match[1]} (${pos.source}:${pos.line}:${pos.column})`;
                        } else {
                            // no original source file name known or in given trace - omit name
                            outStack += `\n    at ${pos.source}:${pos.line}:${pos.column}`;
                        }
                    }
                } else {
                    // no known position
                    break;
                }
            } else {
                // no more parseable lines
                break;
            }
        }
        this.cache.set(error, outStack);
        return outStack;
    }
}