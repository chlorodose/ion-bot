import { SourceMapConsumer } from "source-map";

const getConsumer = (() => {
    let cache: SourceMapConsumer | undefined;
    return () => {
        if (cache === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            cache = new SourceMapConsumer(require("main.js.map"));
        }
        return cache;
    };
})();

export function setupErrorHandler(): void {
    const internalPrepareStackTrace = Error.prepareStackTrace ?? function (error, trace) {
        const errorString = error.toString();
        if (trace.length === 0) {
            return errorString;
        }
        return `${errorString}\n    at ${trace.join("\n    at ")}`;
    };
    try {
        Error.stackTraceLimit = 16;
    } catch { /* empty */ }
    try {
        Error.prepareStackTrace = (error: Error, structuredStackTrace: NodeJS.CallSite[]) => {
            return internalPrepareStackTrace(error, structuredStackTrace.map((value) => {
                let line = value.getLineNumber();
                let column = value.getColumnNumber();
                let file = value.getFileName();

                if ((line !== undefined) && (column !== undefined) && (file === "main")) {
                    const consumer = getConsumer();
                    const compiledPos = value.toString();
                    let transformed = false;
                    const transform = (): void => {
                        if (transformed) return;
                        transformed = true;
                        const pos = consumer.originalPositionFor({
                            line: line as number,
                            column: column as number
                        });
                        file = pos.source ?? undefined;
                        line = pos.line ?? null;
                        column = pos.column ?? null;
                    };
                    Object.defineProperty(value, "getFileName", {
                        value: () => {
                            transform();
                            return file;
                        }
                    });
                    Object.defineProperty(value, "getLineNumber", {
                        value: () => {
                            transform();
                            return line;
                        }
                    });
                    Object.defineProperty(value, "getColumnNumber", {
                        value: () => {
                            transform();
                            return column;
                        }
                    });
                    Object.defineProperty(value, "toString", {
                        value: function () {
                            transform();
                            return `${file}:${line}:${column} (${compiledPos})`;
                        }
                    });
                }

                return value;
            }));
        };
    } catch { /* empty */ }
}






