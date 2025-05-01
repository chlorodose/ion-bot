import { defineConfig } from 'rolldown';
import screeps from "rollup-plugin-screeps";
import screepsConfig from "./screeps.json" with { type: "json" };
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import path from 'node:path';
import rust from "rolldown-plugin-rust";
import MagicString from "magic-string";

const dest = process.env.DEST ?? "";
const token = await readFile("./screeps.key", { encoding: "utf-8" });
let cfg = screepsConfig[dest] ?? null;
if (cfg !== null) {
    cfg["token"] = token;
}


export default defineConfig({
    input: "src/main.ts",
    output: {
        file: "dist/main.js",
        format: "commonjs",
        sourcemap: true
    },
    watch: {
        include: ["src/**/*.proto", "src/**/*.rs", "src/**/*.ts", "Cargo.toml", "Cargo.lock", "build.rs"],
        exclude: ["src/proto/**/*.ts", "src/proto/**/*.rs"]
    },
    plugins: [
        {
            name: "protobuf",
            async buildStart() {
                const command = await spawn("protoc", ["--plugin=./node_modules/.bin/protoc-gen-ts_proto", "--proto_path=src/proto", "--ts_proto_out=src/proto", "src/proto/index.proto"]);
                await new Promise((resolve, reject) => {
                    command.once("error", reject);
                    command.once("close", (code) => {
                        if (code === 0) {
                            resolve();
                        } else {
                            reject(code);
                        }
                    });
                });
            },
        },
        rust({
            wasmBindgenArgs: ["--encode-into", "always"],
            wasmLoadMethod: "external"
        }),
        (() => {
            let resolvedIdSet = new Set();
            return {
                name: "screeps-wasm-patcher",
                buildStart() {
                    resolvedIdSet.clear();
                },
                transform(code, id) {
                    if (id.includes("rolldown-plugin-rust") && id.endsWith("index_bg.js")) {
                        let s = new MagicString(code)
                            .prepend("require(\"fastestsmallesttextencoderdecoder-encodeinto/EncoderDecoderTogether.min.js\");\n");
                        return {
                            code: s.toString(),
                            map: s.generateMap()
                        };
                    }
                },
                resolveId: {
                    order: "post",
                    async handler(id, importer, meta) {
                        if (resolvedIdSet.has(id)) return {
                            id,
                            external: "absolute"
                        };
                        if (id.endsWith(".wasm") && (meta.custom?.["rolldown-plugin-rust"] !== undefined)) {
                            const crateName = meta.custom?.["rolldown-plugin-rust"].crateName;
                            this.emitFile({
                                type: "asset",
                                fileName: `${crateName}.wasm`,
                                source: await readFile(id, { encoding: null })
                            });
                            resolvedIdSet.add(`${crateName}.wasm`);
                            return {
                                id: `${crateName}.wasm`,
                                external: "absolute"
                            };
                        }
                        return null;
                    }
                }
            };
        })(),
        {
            name: "screeps-sourcemap-patcher",
            resolveId: {
                order: "pre",
                handler(source) {
                    if (source === "main.js.map") {
                        return {
                            id: source,
                            external: "absolute"
                        };
                    }
                    return null;
                }
            },
            generateBundle(_, bundle) {
                if ((typeof bundle["main.js.map"]?.source === "string") && !bundle["main.js.map"].source.startsWith("module.exports=")) {
                    bundle["main.js.map"].source = `module.exports=${bundle["main.js.map"].source}`;
                }
            }
        },
        getBabelOutputPlugin({
            configFile: path.resolve(import.meta.dirname, "babel.config.json")
        }),
        screeps({
            config: cfg,
            dryRun: cfg === null
        })
    ]
});