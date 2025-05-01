import { default as getGlobalThis } from "globalthis";
import "fastestsmallesttextencoderdecoder-encodeinto/EncoderDecoderTogether.min.js";

declare global {
    interface Console {
        fatal(msg: string): void;
        getLogLevel(): string;
        setLogLevel(v: string): void;
        logLevel: string;
    }
}

export default function (): void {
    try {
        Object.defineProperty(global, "globalThis", {
            value: getGlobalThis()
        });
    } catch { /* empty */ }
    try {
        console.trace = function (msg: string) {
            console.log(`<span style='color:grey'>${msg}</span>`);
        };
        console.debug = function (msg: string) {
            console.log(`<span style='color:blue'>${msg}</span>`);
        };
        console.info = function (msg: string) {
            console.log(`<span style='color:green'>${msg}</span>`);
        };
        console.warn = function (msg: string) {
            console.log(`<span style='color:orange'>${msg}</span>`);
        };
        console.error = function (msg: string) {
            console.log(`<span style='color:darkred'>${msg}</span>`);
            Game.notify(msg);
        };
        console.fatal = function (msg: string) {
            throw new Error(msg);
        };
        Object.defineProperty(console, "logLevel", {
            get() {
                return Memory.logLevel;
            },
            set(v) {
                Memory.logLevel = v;
            },
        });
        console.getLogLevel = function () {
            return console.logLevel;
        };
        console.setLogLevel = function (v: string) {
            console.logLevel = v;
        };
    } catch { /* empty */ }
    try {
        Object.defineProperty(global, "getCPU", {
            value: function () {
                return Game.cpu.getUsed();
            }
        });
    } catch { /* empty */ }
}