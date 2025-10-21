export interface Config {
    apiUrl: string;
    timeout: number;
    retries: number;
}
export declare class ApiClient {
    private config;
    constructor(config: Config);
    get(endpoint: string): Promise<any>;
    post(endpoint: string, data: any): Promise<any>;
}
export declare function createApiClient(config: Config): ApiClient;
export declare const defaultConfig: Config;
export declare class DataProcessor {
    private data;
    addData(item: any): void;
    processData(): any[];
    filterData(predicate: (item: any) => boolean): any[];
    sortData(compareFn?: (a: any, b: any) => number): any[];
}
export declare class EventEmitter {
    private events;
    on(event: string, listener: Function): void;
    off(event: string, listener: Function): void;
    emit(event: string, ...args: any[]): void;
}
declare const _default: {
    ApiClient: typeof ApiClient;
    DataProcessor: typeof DataProcessor;
    EventEmitter: typeof EventEmitter;
    createApiClient: typeof createApiClient;
    defaultConfig: Config;
};
export default _default;
