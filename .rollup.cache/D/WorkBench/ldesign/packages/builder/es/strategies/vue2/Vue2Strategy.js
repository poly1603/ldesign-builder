/**
 * Vue2 策略
 */
import { LibraryType } from '../../types/library';
export class Vue2Strategy {
    constructor() {
        this.name = 'vue2';
        this.supportedTypes = [LibraryType.VUE2];
        this.priority = 10;
    }
    async applyStrategy(config) {
        return config;
    }
    isApplicable(config) {
        return config.libraryType === LibraryType.VUE2;
    }
    getDefaultConfig() {
        return {};
    }
    getRecommendedPlugins(_config) {
        return [];
    }
    validateConfig(_config) {
        return {
            valid: true,
            errors: [],
            warnings: [],
            suggestions: []
        };
    }
}
//# sourceMappingURL=Vue2Strategy.js.map