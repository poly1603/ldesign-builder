export class ApiClient {
    constructor(config) {
        this.config = config;
    }
    async get(endpoint) {
        const url = `${this.config.apiUrl}${endpoint}`;
        let retries = this.config.retries;
        while (retries > 0) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    return await response.json();
                }
                throw new Error(`HTTP ${response.status}`);
            }
            catch (error) {
                retries--;
                if (retries === 0) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    async post(endpoint, data) {
        const url = `${this.config.apiUrl}${endpoint}`;
        let retries = this.config.retries;
        while (retries > 0) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (response.ok) {
                    return await response.json();
                }
                throw new Error(`HTTP ${response.status}`);
            }
            catch (error) {
                retries--;
                if (retries === 0) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
}
export function createApiClient(config) {
    return new ApiClient(config);
}
export const defaultConfig = {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
};
// 添加更多代码以增加文件大小
export class DataProcessor {
    constructor() {
        this.data = [];
    }
    addData(item) {
        this.data.push(item);
    }
    processData() {
        return this.data.map(item => ({
            ...item,
            processed: true,
            timestamp: Date.now()
        }));
    }
    filterData(predicate) {
        return this.data.filter(predicate);
    }
    sortData(compareFn) {
        return [...this.data].sort(compareFn);
    }
}
export class EventEmitter {
    constructor() {
        this.events = new Map();
    }
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(listener);
    }
    off(event, listener) {
        const listeners = this.events.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    emit(event, ...args) {
        const listeners = this.events.get(event);
        if (listeners) {
            listeners.forEach(listener => listener(...args));
        }
    }
}
export default {
    ApiClient,
    DataProcessor,
    EventEmitter,
    createApiClient,
    defaultConfig
};
//# sourceMappingURL=index.js.map