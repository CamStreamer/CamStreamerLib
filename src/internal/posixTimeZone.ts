const POSIX_STANDARD_PART_REGEX = /^(<[^>]+>|[A-Za-z]{3,})[+-]?\d{1,2}(?::\d{2}){0,2}/;

export const stripPosixDst = (posix: string) => posix.match(POSIX_STANDARD_PART_REGEX)?.[0] ?? posix;
