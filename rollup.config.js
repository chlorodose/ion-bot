import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" with { type: "json" };
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import screeps from "rollup-plugin-screeps";
import target from "./screeps.json" with { type: "json" };
import clear from "rollup-plugin-clear";

export default [
    {
        input: pkg.main,
        output: {
            name: pkg.name,
            file: `dist/main.js`,
            format: "cjs",
            sourcemap: true
        },
        plugins: [
            clear({ targets: ["dist"] }),
            typescript(),
            nodeResolve(),
            commonjs(),
            {
                name: "fix-sourcemap",
                generateBundle: (_, bundle) => {
                    bundle["main.js.map"].source = "module.exports=" + bundle["main.js.map"].source;
                }
            },
            screeps({
                config: target,
                dryRun: process.env.DRYRUN
            })
        ]
    }
];