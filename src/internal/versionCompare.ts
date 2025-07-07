export const assertVersionString = (s: string, msg?: string) => {
    if (!s.match(/^[0-9]+(\.[0-9]+){1,3}$/)) {
        throw new Error(msg ?? `${s} is not a version`);
    }
};

export const isFirmwareVersionAtLeast = (version: string, compareVersion: string) => {
    return firmwareVersionCompare(version, compareVersion) >= 0;
};

export const isVersionAtLeast = (version: string, compareVersion: string) => {
    return versionCompare(version, compareVersion) >= 0;
};

export const firmwareVersionCompare = (a: string, b: string) => {
    const versions = [a, b];

    const matchBetaFirmwareVersion = (x: string) => /^CVP-/.test(x) || /^[0-9]+.*beta/.test(x);

    if (versions.every(matchBetaFirmwareVersion)) {
        return 0; // both versions are beta
    }
    if (matchBetaFirmwareVersion(a)) {
        return -1;
    }
    if (matchBetaFirmwareVersion(b)) {
        return 1;
    }

    return versionCompare(a, b);
};

export const versionCompare = (a: string, b: string) => {
    assertVersionString(a);
    assertVersionString(b);

    const aSplit = parseVersion(a);
    const bSplit = parseVersion(b);

    for (let i = 0; i < aSplit.length; i++) {
        if (aSplit[i] !== bSplit[i]) {
            return aSplit[i] < bSplit[i] ? -1 : 1;
        }
    }

    return 0;
};

export const fixVersionToDots = (version: string) => version.replaceAll('-', '.');

const parseVersion = (version: string) => {
    assertVersionString(version);
    // max length: 4 (checked in assert)
    const parsed = version.split('.').map((s) => parseInt(s));
    parsed.push(...Array(4 - parsed.length).fill(0));
    return parsed;
};
