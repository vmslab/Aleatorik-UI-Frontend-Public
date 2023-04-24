<template>
  <Controller :show-filter="options.filter">
    <DxButton
      v-tooltip="{ text: $t('Save') }"
      class="moz-default-button"
      icon="save"
      type="default"
      :focusStateEnabled="false"
      :disabled="!isEditing"
      :text="$t('Save')"
      @click="saveGroupData"
    />
    <DxButton
      v-tooltip="{ text: $t('Refresh') }"
      class="moz-default-button"
      icon="refresh"
      type="default"
      :focusStateEnabled="false"
      :text="$t('Refresh')"
      @click="loadData"
    />
  </Controller>
  <div class="grp-manager moz-frame-for-outer-control" style="display: flex">
    <SplitBox
      width="var(--size-content-inner-width)"
      height="var(--size-content-inner-height-outer-controller)"
      :minHeight="400"
      :boxes="[
        { type: 'rate', size: 1, minHeight: 200 },
        { type: 'rate', size: 1, minHeight: 200 }
      ]"
      resizable
      horizontal
    >
      <template #box1="{ props }">
        <div class="dx-card" :style="{ width: '100%', height: `${props.parentsHeight}px` }">
          <div class="dx-card-title">
            <div class="dx-card-title-text">{{ $t('Group') }} {{ $t('List') }}</div>
            <div class="spacer"></div>
            <div class="dx-card-title-action">
              <DxButton id="addGroupBtn" v-tooltip="{ text: $t('Add') }" icon="add" stylingMode="text" @click="showGroupEdit(true)" />
              <Popup :visible="popup.groupPopupVisible" title="Group Editor" @hiding="popup.groupPopupVisible = false">
                <div class="moz-area-padding">
                  <DxForm
                    ref="groupForm"
                    class="moz-form"
                    :form-key="groupFormKey"
                    :form-data="groupFormData"
                    validation-group="validationGroup"
                    :show-colon-after-label="false"
                  >
                    <DxItem
                      data-field="name"
                      :editor-options="{
                        disabled: !popup.isAddGroup
                      }"
                      :label="{ text: `${$t('Group')} ${$t('Name')}` }"
                    >
                      <DxRequiredRule message="Name is required" />
                    </DxItem>
                    <DxItem data-field="description" :label="{ text: `${$t('Description')}` }"></DxItem>
                  </DxForm>
                </div>
                <DxToolbarItem
                  widget="dxButton"
                  toolbar="bottom"
                  location="after"
                  :options="{
                    text: $t('Apply'),
                    stylingMode: 'outlined',
                    class: 'moz-button',
                    onClick: onApplyGroup
                  }"
                />
                <DxToolbarItem
                  widget="dxButton"
                  toolbar="bottom"
                  location="after"
                  :options="{
                    text: $t('Close'),
                    stylingMode: 'outlined',
                    class: 'moz-button',
                    onClick: onCloseGroup
                  }"
                />
              </Popup>
            </div>
          </div>
          <div class="dx-card-text">
            <DxList
              class="moz-list"
              :data-source="groupItems"
              :allow-item-deleting="false"
              :focus-state-enabled="false"
              :active-state-enabled="false"
              :show-selection-controls="true"
              page-load-mode="scrollBottom"
              selection-mode="none"
              key-expr="groupId"
              :selected-item-keys="options.selectedGroupKeys"
              @item-click="onGroupClick"
            >
              <template #item="{ data: item }">
                <div>
                  <div class="text-area">
                    <div class="moz-body-02">{{ $t(item.name) }}</div>
                    <div class="moz-body-02 moz-color-font5" v-if="item.description">
                      {{ item.description }}
                    </div>
                  </div>
                  <span class="spacer"></span>
                  <span v-if="['admin', 'default'].indexOf(item.groupId) < 0" class="button-area">
                    <DxButton
                      v-tooltip="{ text: $t('Modify') }"
                      class="moz-text-button"
                      icon="edit"
                      stylingMode="text"
                      @click="showGroupEdit(false, item)"
                    ></DxButton>
                    <DxButton
                      v-tooltip="{ text: $t('Remove') }"
                      class="moz-text-button"
                      icon="trash"
                      stylingMode="text"
                      :disabled="!groupItems || groupItems.length < 2"
                      @click="onRemoveGroup(item)"
                    ></DxButton>
                  </span>
                </div>
              </template>
            </DxList>
          </div>
        </div>
      </template>
      <template #box2="{ props }">
        <div class="dx-card" :style="{ width: '100%', height: `${props.parentsHeight}px` }">
          <div class="dx-card-title">
            <div class="dx-card-title-text">{{ $t('Group') }} {{ $t('Detail') }}</div>
          </div>
          <div class="dx-card-text">
            <WjFlexGrid
              :style="{ height: `${props.contentsInnerHeight - 4}px` }"
              :items-source="menuMapItems"
              headers-visibility="Column"
              child-items-path="children"
              selection-mode="Cell"
              :initialized="onInitialized"
              :loadedRows="onLoadedRows"
              :cellEditEnding="onCellEditEnding"
              :formatItem="onFormatItem"
              :isReadOnly="!currentMenu?.isWrite"
            >
              <WjFlexGridColumn
                binding="menuId"
                :header="`${$t(`Menu`)} ${$t(`ID`)}`"
                :isReadOnly="true"
                :visible="false"
              ></WjFlexGridColumn>
              <WjFlexGridColumn width="*" binding="name" :header="`${$t(`Menu`)} ${$t(`Name`)}`" :isReadOnly="true" />
              <WjFlexGridColumn width="*" binding="path" :header="`${$t(`Menu`)} ${$t(`Name`)}`" :isReadOnly="true" />
              <WjFlexGridColumn width="*" binding="isRead" :header="$t(`IsRead`)" dataType="Boolean"></WjFlexGridColumn>
              <WjFlexGridColumn width="*" binding="isWrite" :header="$t(`IsWrite`)" dataType="Boolean"></WjFlexGridColumn>
            </WjFlexGrid>
          </div>
        </div>
      </template>
    </SplitBox>

    <DxLoadPanel
      :visible="options.loading"
      :show-indicator="true"
      :show-pane="true"
      :shading="true"
      :hideOnOutsideClick="false"
      container=".grp-manager"
      shading-color="rgba(0,0,0,0.4)"
      message="Please, wait..."
    />
  </div>
</template>

<script setup lang="ts">
import { Get, Add, Modify, Remove, Save } from '../../stores/queryStore';
import { onMounted, ref, reactive } from 'vue';
import { useMutation, useQuery, useQueryClient } from 'vue-query';
import { WjFlexGrid, WjFlexGridColumn } from '@grapecity/wijmo.vue2.grid';
import { CellEditEndingEventArgs, FlexGrid, FormatItemEventArgs } from '@grapecity/wijmo.grid';

import 'devextreme-vue/text-area';
import { DxList } from 'devextreme-vue/list';
import { DxLoadPanel } from 'devextreme-vue/load-panel';
import { DxToolbarItem } from 'devextreme-vue/popup';
import { DxForm, DxItem, DxRequiredRule } from 'devextreme-vue/form';
import ValidationEngine from 'devextreme/ui/validation_engine';

import { useTranslation } from 'i18next-vue';
import { showConfirm, showMessage } from '../../utils/dialog';
import { Controller, DxPopup as Popup } from '../../components';
import { SplitBox } from '@aleatorik-ui/vue-component-wijmo';
import DxButton from 'devextreme-vue/button';
import { systemId } from '../../utils/env';
import { generateGUID } from '@aleatorik-ui/common-ui';

import { storeToRefs } from 'pinia';
import { useMenuStore } from '../../stores/mainStore';

const menuModule = useMenuStore();
const { isEditing, currentMenu } = storeToRefs(menuModule);
const { t } = useTranslation();

const groupItems = ref<any[] | null>([]);
const menuMapItems = ref<any[] | null>([]);

const groupForm = ref<DxForm | null>(null);
const groupFormKey = ref<any>({});
const groupFormData = ref<any>({});

let flexGrid: FlexGrid | null = null;

const options = reactive({
  loading: false,
  filter: true,
  selectedGroupKeys: [] as any[],
  selectedGroup: {} as any
});
const popup = reactive({
  groupPopupVisible: false,
  isAddGroup: false
});
const queryClient = useQueryClient();

const menuSortingRule = (x: any, y: any) => {
  const adminMenuName = 'admin';
  const defaultMenuName = 'default';
  return x.name === adminMenuName
    ? -1
    : y.name === adminMenuName
    ? 1
    : x.name === defaultMenuName
    ? -1
    : y.name === defaultMenuName
    ? 1
    : x.name < y.name
    ? -1
    : x.name > y.name
    ? 1
    : 0;
};

useQuery('Group', ({ queryKey }) => Get(queryKey[0], systemId), {
  refetchOnWindowFocus: false,
  onSuccess: (result: any) => {
    menuModule.endEdit();
    if (result && result.data) {
      groupItems.value = result.data.sort(menuSortingRule);
      setTimeout(async () => {
        if (!options.selectedGroupKeys || options.selectedGroupKeys.length === 0) {
          const groupId = result.data[0]?.groupId || '';
          options.selectedGroupKeys = [groupId];
          options.selectedGroup = result.data[0];
        }

        await getMenuMap.mutateAsync({ systemId: systemId, groupId: options.selectedGroupKeys[0] } as any);
      }, 100);
    } else groupItems.value = [];
  },
  onError: (err: any) => {
    showMessage('An error occurred while loading data', false);
  }
});

const getMenuMap = useMutation(param => Get('MenuMap', param), {
  onSuccess: result => {
    if (result && result.data && result.data.length > 0) {
      menuMapItems.value = createMenuItems(result.data.map(setMenuMapId));
    } else menuMapItems.value = [];

    showMessage(`Group '${options.selectedGroup.name}' Data load complete`, true);
  },
  onError: err => {
    showMessage('An error occurred while loading data', false);
    groupItems.value = [];
  }
});

const setMenuMapId = (d: any) => {
  if (!d.groupId || d.groupId.length === 0) d.groupId = options.selectedGroupKeys[0];
  if (!d.menuMapId || d.menuMapId.length === 0) d.menuMapId = generateGUID();

  return d;
};

const addGroup = useMutation(param => Add('Group', param), {
  onSuccess: result => {
    if (result && result.data > 0) showMessage(`Added group item.`, result.data > 0);
  },
  onError: err => {
    showMessage('An error occurred while adding data', false);
  }
});

const modifyGroup = useMutation(param => Modify('Group', param), {
  onSuccess: result => {
    if (result && result.data > 0) showMessage(`Updated group item.`, result.data > 0);
  },
  onError: err => {
    showMessage('An error occurred while updating data', false);
  }
});

const removeGroup = useMutation(param => Remove('Group', param), {
  onSuccess: result => {
    if (result && result.data > 0) showMessage(`Removed group item,`, result.data > 0);
  },
  onError: err => {
    showMessage('An error occurred while removing data', false);
  }
});

const saveMenuMap = useMutation(param => Save('MenuMap', param), {
  onSuccess: result => {
    if (result) showMessage(`Affected ${result.data} Row${result.data > 1 ? 's' : ''}`, result.data > 0);
    menuModule.endEdit();
  },
  onError: err => {
    showMessage('An error occurred while saving data', false);
  }
});

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  options.loading = true;
  queryClient.invalidateQueries('GroupBySystem');
  options.loading = false;
};

const onInitialized = (grid: FlexGrid) => {
  flexGrid = grid;
};

const onLoadedRows = (grid: FlexGrid) => {
  grid.rows.forEach(row => {
    row.isReadOnly = false;
  });
};

const onCellEditEnding = (grid: FlexGrid, e: CellEditEndingEventArgs) => {
  const column = e.getColumn().binding;
  const item = e.getRow().dataItem;
  if (!column || !item) return;
  /*
  if (["admin"].indexOf(item.groupId) >= 0) {
    e.cancel = true;
    showMessage("'admin' group cannot be edited", false);
    return;
  }
*/
  menuModule.beginEdit();

  if (['isRead', 'isWrite'].indexOf(column) > -1) {
    if (grid.activeEditor.checked) updateParentProperty(item, column, grid.activeEditor.checked);
    updateChildProperty(item, column, grid.activeEditor.checked);
  }
  if (column === 'isStartup') grid.rows.forEach(row => (row.dataItem.isStartup = e.getRow() === row));
};

const updateParentProperty = (item: any, prop: string, value: any) => {
  item[prop] = value;

  const parent = menuMapItems.value?.find(menu => menu.menuId === item.categoryId);
  if (!parent) return;

  updateParentProperty(parent, prop, value);
};

const updateChildProperty = (item: any, prop: string, value: any) => {
  item[prop] = value;

  const children = item.children;
  if (!children || children.length === 0) return;

  children.forEach((child: any) => {
    updateChildProperty(child, prop, value);
  });
};

const onFormatItem = (s: FlexGrid, e: FormatItemEventArgs) => {
  const item = e.getRow().dataItem;
  if (e.panel.cellType !== 1) {
    e.cell.classList.add('wj-align-center');
    return;
  }
  if (item.children && item.children.length > 0) {
    e.cell.style.backgroundColor = 'var(--color-commonheader)';
  } else {
    e.cell.style.backgroundColor = 'var(--color-back)';
  }

  e.cell.style.color = 'var(--color-font4)';
};

const createMenuItems = (datas: any[]): any[] => {
  try {
    const datasMap: any = {};
    datas.forEach(data => {
      datasMap[data.menuId] = data;
    });

    const cloneDatas = JSON.parse(JSON.stringify(datas));
    cloneDatas
      .filter((cdata: any) => cdata.categoryId && cdata.categoryId.length > 0)
      .forEach((cdata: any) => {
        if (!cdata.categoryId) return;

        const parentData = datasMap[cdata.categoryId];
        const childIdx = datas.findIndex(data => cdata.menuId == data.menuId);
        if (!parentData || childIdx < 0) return;

        const childData = datas.splice(childIdx, 1);

        if (!parentData.children) parentData.children = [];

        parentData.children.push(...childData);
        parentData.children.sort((x: any, y: any) => x.sequence - y.sequence);
      });
    datas.sort((x, y) => x.sequence - y.sequence);
    return datas;
  } catch (e) {
    console.log(e);
  }
  return [];
};

const onGroupClick = async (e: any) => {
  if (!e.itemData) return;
  const item = e.itemData;

  if (isEditing.value) {
    const result = await showConfirm({ message: 'Current changes will be reset. continue?', title: 'Change Group' });
    if (!result) return;
  }

  menuModule.endEdit();
  options.selectedGroupKeys = [item.groupId];
  options.selectedGroup = item;

  // queryClient.invalidateQueries("MenuMap");
  await getMenuMap.mutateAsync({ systemId: systemId, groupId: options.selectedGroupKeys[0] } as any);
};

const showGroupEdit = (isAdd: boolean, item?: any) => {
  popup.groupPopupVisible = true;
  popup.isAddGroup = isAdd;

  groupFormData.value = {
    groupId: isAdd ? generateGUID() : item.groupId,
    systemId: systemId,
    name: isAdd ? '' : item.name,
    description: isAdd ? '' : item.description
  };
};

const onRemoveGroup = async (item: any) => {
  const result = await showConfirm({ message: `Remove ${item.name}.\nContinue?`, title: 'Remove' });
  if (!result) return;

  removeGroup.mutateAsync(item);

  await loadData();
};

const onApplyGroup = async () => {
  const valid = ValidationEngine.validateGroup('validationGroup');
  if (!valid.isValid) {
    showMessage(`${t(`InvalidDataMessage`)}`, false);
    return;
  }
  popup.groupPopupVisible = false;

  if (popup.isAddGroup) {
    await addGroup.mutateAsync(groupFormData.value);
  } else {
    await modifyGroup.mutateAsync(groupFormData.value);
  }
  await loadData();
};

const onCloseGroup = () => {
  popup.groupPopupVisible = false;
};

const saveGroupData = () => {
  if (!menuMapItems.value) {
    showMessage('Not found data', false);
    return;
  }
  options.loading = true;
  saveMenuMap.mutateAsync(createFlatMenuItems(menuMapItems.value) as any);
  options.loading = false;
};

const createFlatMenuItems = (datas: any[], categoryId: string = '', flatMenus: any[] = []): any[] => {
  if (!datas || datas.length === 0) return [];
  try {
    datas.forEach((data, sequence) => {
      flatMenus.push(Object.assign(data, { categoryId, sequence }));
      if (data.children && data.children.length > 0) {
        createFlatMenuItems(data.children, data.menuId, flatMenus);
      }
    });
  } catch (e) {
    console.log(e);
  }
  return flatMenus;
};
</script>
<style>
.wj-cells .wj-cell.wj-state-selected > button span::after {
  color: var(--color-font4);
}
</style>
