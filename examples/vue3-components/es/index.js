/*!
 * *******************************************
 * @ldesign/vue3-components-example v1.0.0 *
 * Built with rollup                       *
 * Build time: 2024-09-29 15:12:37         *
 * Build mode: production                  *
 * Minified: No                            *
 * *******************************************
 */
export { BUTTON_COMPONENT_NAME } from './button/index.js';
export { INPUT_COMPONENT_NAME } from './input/index.js';
export { MODAL_COMPONENT_NAME } from './modal/index.js';
import './modal/Modal.vue.js';
import script from './modal/Modal.vue2.js';
import './input/Input.vue.js';
import script$1 from './input/Input.vue2.js';
import './button/Button.vue.js';
import script$2 from './button/Button.vue2.js';

const components = [script$2, script$1, script];
const VERSION = "1.0.0";
const LIBRARY_INFO = {
  name: "@ldesign/vue3-components-example",
  version: VERSION,
  description: "Vue3 \u7EC4\u4EF6\u5E93\u793A\u4F8B - \u5C55\u793A\u5982\u4F55\u4F7F\u7528 @ldesign/builder \u6253\u5305 Vue3 \u7EC4\u4EF6\u5E93",
  author: "LDesign Team",
  license: "MIT",
  repository: "https://github.com/ldesign/ldesign",
  homepage: "https://ldesign.dev"
};
function install(app, options = {}) {
  if (install.installed) {
    return;
  }
  install.installed = true;
  components.forEach((component) => {
    if (component.install) {
      component.install(app);
    } else if (component.name) {
      app.component(component.name, component);
    }
  });
  if (options.addLibraryInfo !== false) {
    app.config.globalProperties.$LDESIGN_VUE3_COMPONENTS = LIBRARY_INFO;
  }
}
function getLibraryInfo() {
  return LIBRARY_INFO;
}
function printLibraryInfo() {
  console.log(`
\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E
\u2502                   Vue3 Components Example                   \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502 Name:        ${LIBRARY_INFO.name.padEnd(43)} \u2502
\u2502 Version:     ${LIBRARY_INFO.version.padEnd(43)} \u2502
\u2502 Description: ${LIBRARY_INFO.description.slice(0, 43).padEnd(43)} \u2502
\u2502 Author:      ${LIBRARY_INFO.author.padEnd(43)} \u2502
\u2502 License:     ${LIBRARY_INFO.license.padEnd(43)} \u2502
\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F
  `);
}
var index = {
  install,
  VERSION,
  LIBRARY_INFO,
  getLibraryInfo,
  printLibraryInfo,
  // 组件
  Button: script$2,
  Input: script$1,
  Modal: script
};

export { script$2 as Button, script$1 as Input, LIBRARY_INFO, script as Modal, VERSION, index as default, getLibraryInfo, printLibraryInfo };
/*! End of @ldesign/vue3-components-example | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
