<template>
  <div class="dx-card">
    <div class="dx-card-title">
      <div class="dx-card-title-text">Table</div>
      <div class="spacer"></div>
      <div class="dx-card-title-action">
        <DxButton v-tooltip="{ text: $t('Edit') }" icon="edit" @click="onEdit" />
      </div>
    </div>
    <div class="dx-card-text">
      <div class="flex-center">
        <i class="mozart-icons m-061_icon-data-table" style="font-size: 40px"></i>
      </div>
      <div class="flex-center">{{ entity.Name }}</div>
      <table-edit-popup
        v-model="edit"
        :entity="entity"
        :entityProps="entityProps"
        @save="onSave"
      ></table-edit-popup>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DxButton } from "devextreme-vue/button";
import { IEntityDef, IEntityPropDef, generateGUID } from "mozart-common";

import TableEditPopup from "../popup/TableEditPopup.vue";

@Component({
  components: {
    DxButton,
    TableEditPopup,
  },
})
export default class TableNode extends Vue {
  @Prop({ type: Number, required: true, default: 1 }) public id!: number;
  @Prop({ type: Object, required: true }) public data!: Record<string, any>;

  public edit: boolean = false;

  constructor() {
    super();
  }

  public get entity(): IEntityDef {
    const entity: IEntityDef = {
      ID: generateGUID(),
      Name: "",
      TableName: "",
    };

    if (!this.data["entity"]) {
      this.data["entity"] = entity;
    }
    return this.data["entity"];
  }

  public get entityProps(): IEntityPropDef[] {
    const result: IEntityPropDef[] = [];

    if (!this.data["entityProps"]) {
      this.data["entityProps"] = result;
    }
    return this.data["entityProps"];
  }

  public onEdit(e: any) {
    this.edit = true;
  }

  public onSave(entity: IEntityDef, entityProps: IEntityPropDef[]) {
    console.log(entity, entityProps);
  }
}
</script>
