// 测试外部依赖处理的简单示例
// 使用简单的函数模拟外部依赖，避免类型错误
// 模拟 lodash debounce 函数
function mockDebounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}
// 模拟 React createElement 函数
function mockCreateElement(type, props, ...children) {
    return {
        type,
        props: { ...props, children }
    };
}
export function createDebouncedFunction(fn, delay) {
    return mockDebounce(fn, delay);
}
export function createReactComponent() {
    return mockCreateElement('div', null, 'Hello World');
}
export default {
    createDebouncedFunction,
    createReactComponent
};
//# sourceMappingURL=index.js.map