export const FIRMWARE_WITH_BITRATE_MODES_SUPPORT = '11.11.73';
export const FIRMWARE_WITH_OVERLAYS_SUPPORT = '10.7.0';

export const PORT_PARAMS = {
    inputNbr: 'Input.NbrOfInputs',
    outputNbr: 'Output.NbrOfOutputs',
    inputName: (port: number) => `IOPort.I${port}.Input.Name`,
    outputName: (port: number) => `IOPort.I${port}.Output.Name`,
    inputState: (port: number) => `IOPort.I${port}.Input.Trig`,
    outputState: (port: number) => `IOPort.I${port}.Output.Active`,
    configurable: (port: number) => `IOPort.I${port}.Configurable`,
    usage: (port: number) => `IOPort.I${port}.Usage`,
    direction: (port: number) => `IOPort.I${port}.Direction`,
} as const;
