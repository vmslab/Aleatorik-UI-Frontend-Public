import Vue from "vue";
import { getElementHeight, getElementWidth } from "mozart-common";

export const getHeight = (vue: Vue, defaultVal: number = 0): number => {
  if (defaultVal || !vue) {
    return defaultVal;
  }
  if (vue.$el) {
    return getElementHeight(vue.$el);
  }
  return getHeight(vue.$parent as Vue, defaultVal);
};

export const getWidth = (vue: Vue, defaultVal: number = 0): number => {
  if (defaultVal || !vue) {
    return defaultVal;
  }
  if (vue.$el) {
    return getElementWidth(vue.$el);
  }
  return getWidth(vue.$parent as Vue, defaultVal);
};
