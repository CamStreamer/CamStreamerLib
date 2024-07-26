export function arrayToUrl(arr: string | string[]) {
    if (Array.isArray(arr)) {
        return arr.join(',');
    } else {
        return arr;
    }
}

export function parseCameraPTZfromReq(response: string) {
    const json = JSON.parse(response);

    const res: Record<number, TCameraPTZItem[]> = {};

    Object.keys(json).forEach((key) => {
        if (!key.startsWith('Camera ')) {
            return;
        }
        const camera = Number(key.replace('Camera ', ''));

        if (!isNullish(json[key].presets)) {
            res[camera] = parsePTZ(json[key].presets);
        }
    });

    return res;
}
