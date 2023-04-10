import { VNode, VNodeDirective } from "vue";
import { set, get } from "lodash";
import { addTooltipEvent } from "mozart-common";
import ElementWatcher from "../utils/ElementWatcher";

const watcherName: string = "tooltipWatcher";

const createGridTooltip = (
  node: VNode,
  buttons: Array<{ class: string; text: string }>,
  tb: boolean,
) => {
  return () => {
    node.context?.$nextTick(() => {
      buttons.forEach((button: any) => {
        const els = document.getElementsByClassName(button.class);
        if (els && els.length > 0) {
          const el0 = els[0] as HTMLElement;
          addTooltipEvent(el0, button.text, tb);
          el0.title = "";
        }
      });
    });
  };
};

export default {
  bind: (el: HTMLElement, binding: VNodeDirective, node: VNode) => {
    const watcher = new ElementWatcher(
      el,
      true,
      createGridTooltip(node, binding.value.buttons, binding.value.tb || true),
    );
    set(el, watcherName, watcher);
  },
  update: (el: HTMLElement, binding: VNodeDirective, node: VNode) => {
    const watcher = get(el, watcherName) as ElementWatcher;
    if (watcher) {
      watcher.callback = createGridTooltip(node, binding.value.buttons, binding.value.tb || true);
    } else {
      const newWatcher = new ElementWatcher(
        el,
        true,
        createGridTooltip(node, binding.value.buttons, binding.value.tb || true),
      );
      set(el, watcherName, newWatcher);
    }
  },
  unbind: (el: HTMLElement, binding: VNodeDirective, node: VNode) => {
    const watcher = get(el, watcherName) as ElementWatcher;
    watcher.disconnect();
  },
};
