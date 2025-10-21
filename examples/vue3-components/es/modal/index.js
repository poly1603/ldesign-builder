/*!
 * *******************************************
 * @ldesign/vue3-components-example v1.0.0 *
 * Built with rollup                       *
 * Build time: 2024-09-29 15:12:37         *
 * Build mode: production                  *
 * Minified: No                            *
 * *******************************************
 */
import './Modal.vue.js';
import script from './Modal.vue2.js';

script.install = function(app) {
  app.component(script.name || "LModal", script);
};
const MODAL_COMPONENT_NAME = "LModal";

export { MODAL_COMPONENT_NAME, script as Modal, script as default };
/*! End of @ldesign/vue3-components-example | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
