import { ErrorMapper } from "./error";


function main() {
    console.log(`Tick ${Game.time}`);
}

const errorMapper = new ErrorMapper();
export function loop() {
    try {
        main();
    } catch (err) {
        console.log(`<span style='color:red'>${errorMapper.mapError(err as Error)}</span>`);
    }
}