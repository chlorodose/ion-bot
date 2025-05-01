export function compileId(id: string): Uint8Array {
    if (id.length !== 24) {
        throw new Error("Cannot compile id");
    }
    const array = new Uint8Array(new Array(12).fill(0));
    for (let i = 0; i < 12; i++) {
        array[i] = parseInt(id.slice(i * 2, (i + 1) * 2), 16);
    }
    return array;
}
export function decompileId(array: Uint8Array): string {
    if (array.length !== 12) {
        throw new Error("Cannot decompile array to id");
    }
    let s = "";
    array.forEach((value) => {
        const byte = value.toString(16);
        s += (byte.length !== 1) ? byte : `0${byte}`;
    });
    return s;
}
