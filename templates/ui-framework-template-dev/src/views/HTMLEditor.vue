<template>
  <div>
    <div class="moz-frame">
      <moz-controller> </moz-controller>
      <DxHtmlEditor>
        <DxToolbar>
          <DxItem name="undo" />
          <DxItem name="redo" />
          <DxItem name="separator" />
          <DxItem :accepted-values="headerValues" name="header" />
          <DxItem name="separator" />
          <DxItem name="bold" />
          <DxItem name="italic" />
          <DxItem name="strike" />
          <DxItem name="underline" />
          <DxItem name="separator" />
          <DxItem name="alignLeft" />
          <DxItem name="alignCenter" />
          <DxItem name="alignRight" />
          <DxItem name="alignJustify" />
          <DxItem name="separator" />
        </DxToolbar>
      </DxHtmlEditor>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DxHtmlEditor, DxToolbar, DxItem } from "devextreme-vue/html-editor";
import { DxButton } from "devextreme-vue/button";

@Component({
  components: {
    DxHtmlEditor,
    DxToolbar,
    DxItem,
    DxButton,
  },
})
export default class HTMLEditor extends Vue {
  public headerValues = [false, 1, 2, 3, 4, 5];

  constructor() {
    super();
  }
}
</script>
