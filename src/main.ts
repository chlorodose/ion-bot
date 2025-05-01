import pollyfill from "./pollyfill";
pollyfill();
import { setupErrorHandler } from "./mapError";
setupErrorHandler();

import { Manager, default as wasmInit } from "../Cargo";
import { WorldDiff, WorldStat } from "./worldStat";
import { IActionType, IGameActions, IWorldDiff } from "./proto";
import { decompileId } from "./typeCompiler";

if (Game.cpu.tickLimit < 500) {
    console.warn("CPU buget not enough, compile defered");
    Game.cpu.halt!();
}

declare global {
    interface Memory {
        logLevel: string
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any)["Memory"] = JSON.parse(RawMemory.get());

if (!("logLevel" in Memory)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Memory as any).logLevel = "trace";
}

wasmInit();

const manager = new Manager();

let prevWorldStat: WorldStat | null = null;

function tick(): void {
    const worldStat = new WorldStat();
    const diff = new WorldDiff(prevWorldStat, worldStat);
    prevWorldStat = worldStat;
    const actions = IGameActions.decode(manager.tick(IWorldDiff.encode(diff).finish()));
    actions.actions.forEach((value) => {
        try {
            let actionName;

            switch (value.action) {
                case IActionType.Destroy:
                    actionName = "destroy";
                    break;
                case IActionType.Suicide:
                    actionName = "suicide";
                    break;
                case IActionType.UNRECOGNIZED:
                    throw new Error("Action type unrecognized");
            };

            if (value.id !== undefined) {
                const id = decompileId(value.id);
                const object = Game.getObjectById(id) as Partial<Record<string, unknown>> | null;
                if (typeof object !== "object" || object === null) {
                    throw new Error(`Id ${id} not exist`);
                }
                if (typeof object[actionName] !== "function") {
                    throw new Error(`Action ${actionName} not exist on object ${object}`);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const returnCode = (object[actionName] as any)();
                if (returnCode !== OK) {
                    throw new Error(`Action ${actionName} returns error ${returnCode}`);
                }
            }
        } catch (error) {
            console.log(`${error}: ${JSON.stringify(value)}`);
        }
    });
    RawMemory.set(JSON.stringify(Memory));
}

let doHalt = false;

export const loop = (): void => {
    if (doHalt) Game.cpu.halt!();
    pollyfill();
    try {
        tick();
    } catch (error) {
        const str = (error instanceof Error) ? error.stack : `${error}`;
        console.error(`Throw error on ${Game.time}(${new Date()}):\n${str}`);
        doHalt = true;
    }
};