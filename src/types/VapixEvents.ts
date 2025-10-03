export type TVapixEventMessage = {
    apiVersion: string;
    method: string;
    params: {
        notification: {
            timestamp: number;
            topic: string;
            message: {
                source: Record<string, string>;
                data: Record<string, string>;
                key: Record<string, string>;
            };
        };
    };
};
