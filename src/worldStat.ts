import { IWorldDiff } from "./proto";
export class WorldStat {
    tick: number;
    constructor() {
        this.tick = Game.time;
    }
}

export class WorldDiff implements IWorldDiff {
    tick: number;
    constructor(_prev: WorldStat | null, now: WorldStat) {
        this.tick = now.tick;
    }
}