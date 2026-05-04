export type TDeclaration = {
    type?: '' | 'SOURCE' | 'DATA';
    namespace: string;
    key: string;
    value: string | boolean | number;
    value_type: 'STRING' | 'INT' | 'BOOL' | 'DOUBLE';
    key_nice_name?: string;
    value_nice_name?: string;
};

export type TEventDeclaration = {
    declaration_id: string;
    stateless: boolean;
    declaration: TDeclaration[];
};

export type TEventUndeclaration = {
    declaration_id: string;
};

export type TEventData = {
    namespace: string;
    key: string;
    value: string | boolean | number;
    value_type: 'STRING' | 'INT' | 'BOOL' | 'DOUBLE';
};

export type TCamScripterEvent = {
    declaration_id: string;
    event_data: TEventData[];
};

export type TCamScripterResponse = {
    call_id: number;
    message: string;
};

export type TCamScripterErrorResponse = {
    error: string;
    call_id?: number;
};

export type TCamScripterMessage = {
    call_id: number;
    command: string;
    data: unknown;
};

export type TAsyncMessage = {
    resolve: (value: TCamScripterResponse) => void;
    reject: (reason?: any) => void;
    sentTimestamp: number;
};
