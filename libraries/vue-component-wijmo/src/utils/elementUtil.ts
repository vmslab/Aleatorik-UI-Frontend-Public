import { ComponentInternalInstance } from "vue";
import { getElementHeight, getElementWidth } from "mozart-common";

export const getHeight = (component?: ComponentInternalInstance | null, defaultVal: number = 0): number => {
  if (defaultVal || !component) {
    return defaultVal;
  }
  if (component.vnode.el) {
    return getElementHeight(component.vnode.el as Element);
  }
  return getHeight(component.parent, defaultVal);
};

export const getWidth = (component?: ComponentInternalInstance | null, defaultVal: number = 0): number => {
  if (defaultVal || !component) {
    return defaultVal;
  }
  if (component.vnode.el) {
    return getElementWidth(component.vnode.el as Element);
  }
  return getWidth(component.parent, defaultVal);
};
