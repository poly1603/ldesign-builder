/*!
 * *******************************************
 * @ldesign/vue3-components-example v1.0.0 *
 * Built with rollup                       *
 * Build time: 2024-09-29 15:12:37         *
 * Build mode: production                  *
 * Minified: No                            *
 * *******************************************
 */
import './Input.vue.js';
import script from './Input.vue2.js';

script.install = function(app) {
  app.component(script.name || "LInput", script);
};
const INPUT_COMPONENT_NAME = "LInput";

export { INPUT_COMPONENT_NAME, script as Input, script as default };
/*! End of @ldesign/vue3-components-example | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
