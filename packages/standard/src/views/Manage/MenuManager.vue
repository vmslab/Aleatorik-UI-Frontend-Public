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
      @click="saveData"
    />
    <input ref="file" type="file" :onchange="uploadFile" style="display: none" />
    <DxButton
      v-tooltip="{ text: $t('Import') }"
      class="moz-default-button"
      icon="import"
      type="default"
      :focusStateEnabled="false"
      :text="$t('Import')"
      @click="file.click()"
    />
    <DxButton
      v-tooltip="{ text: $t('Export') }"
      class="moz-default-button"
      icon="export"
      type="default"
      :focusStateEnabled="false"
      :text="$t('Export')"
      @click="exportData"
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
    <template #title>
      <i
        v-if="options.filter"
        v-tooltip="{ text: t('HideFilter') }"
        @click="options.filter = !options.filter"
        class="mozart-icons moz-filter-icon-tap controller-title-button"
      />
      <i
        v-else
        v-tooltip="{ text: t('ShowFilter') }"
        @click="options.filter = !options.filter"
        class="mozart-icons moz-filter-icon controller-title-button"
      />
    </template>
    <template #filter>
      <div>
        <label>{{ $t("Menu") }} {{ $t("ID") }}</label>
        <DxTextBox v-model="newItem.menuId" />
      </div>
      <div>
        <label>{{ $t("Menu") }} {{ $t("Name") }}</label>
        <DxTextBox v-model="newItem.name" />
      </div>
      <div>
        <label>{{ $t("Menu") }} {{ $t("Path") }}</label>
        <DxTextBox v-model="newItem.path" />
      </div>
      <div>
        <label>{{ $t("Menu") }} {{ $t("Type") }}</label>
        <DxSelectBox v-model="newItem.type" :items="['Menu', 'Category']" />
      </div>

      <div>
        <DxButton
          v-tooltip="{ text: `${$t('Add')}(${$t('Top')})` }"
          class="moz-default-button"
          icon="add"
          type="default"
          :focusStateEnabled="false"
          :text="`${$t('Add')}(${$t('Top')})`"
          @click="addNodeFirst"
        />
        <DxButton
          v-tooltip="{ text: `${$t('Add')}(${$t('Bottom')})` }"
          class="moz-default-button"
          icon="add"
          type="default"
          :focusStateEnabled="false"
          :text="`${$t('Add')}(${$t('Bottom')})`"
          @click="addNodeLast"
        />
      </div>
      <div>
        <DxButton
          v-tooltip="{ text: `${$t('Add')}(${$t('Next')})` }"
          class="moz-default-button"
          icon="add"
          type="default"
          :focusStateEnabled="false"
          :text="`${$t('Add')}(${$t('Next')})`"
          :disabled="!(options.selectedType === 'Menu')"
          @click="addNodeNext"
        />
        <DxButton
          v-tooltip="{ text: `${$t('Add')}(${$t('Child')})` }"
          class="moz-default-button"
          icon="add"
          type="default"
          :focusStateEnabled="false"
          :text="`${$t('Add')}(${$t('Child')})`"
          :disabled="!(options.selectedType === 'Category')"
          @click="addNodeChild"
        />
      </div>
      <div>
        <DxButton
          v-tooltip="{ text: $t('Remove') }"
          class="moz-default-button"
          icon="trash"
          type="default"
          :focusStateEnabled="false"
          :text="$t('Remove')"
          @click="removeSelectedNode"
        />
      </div>
    </template>
  </Controller>
  <div class="menu-manager moz-frame-for-outer-control" style="display: flex">
    <SplitBox
      width="var(--size-content-inner-width)"
      height="var(--size-content-inner-height-outer-controller)"
      :minWidth="600"
      :boxes="[
        { type: 'rate', size: 1, minWidth: 200 },
        { type: 'rate', size: 1, minWidth: 200 },
        { type: 'rate', size: 1, minWidth: 200 },
      ]"
      resizable
      horizontal
    >
      <template #box1="{ props }">
        <div class="dx-card" :style="{ width: '100%', height: `${props.parentsHeight}px` }">
          <div class="dx-card-title">
            <div class="dx-card-title-text">{{ $t("Menu") }} {{ $t("Setting") }}</div>
            <div class="spacer"></div>
            <div class="dx-card-title-action">
              <DxButton v-tooltip="{ text: $t('Delete') }" icon="trash" stylingMode="text" />
            </div>
          </div>
          <div class="dx-card-text">
            <WjTreeView
              :items-source="menuItems"
              displayMemberPath="name"
              childItemsPath="children"
              :initialized="onInitialized"
              :isReadOnly="!currentMenu?.isWrite"
              :autoCollapse="false"
              :allowDragging="currentMenu?.isWrite"
              :expandOnClick="true"
              :formatItem="onFormatItem"
              :dragOver="onDragOver"
              :dragEnd="onDragEnd"
              :nodeEditEnded="onNodeEditEnded"
              :selectedItemChanged="onSelectedItemChanged"
              :isCollapsedChanging="onIsCollapsedChanging"
            >
            </WjTreeView>
          </div>
        </div>
      </template>
      <template #box2="{ props }">
        <div class="dx-card" :style="{ width: '100%', height: `${props.parentsHeight}px` }">
          <div class="dx-card-title">
            <div class="dx-card-title-text">{{ $t("Menu") }} {{ $t("PathSetting") }}</div>
            <div class="spacer"></div>
            <div class="dx-card-title-action">
              <DxButton v-tooltip="{ text: $t('Delete') }" icon="trash" stylingMode="text" />
            </div>
          </div>
          <div class="dx-card-text">
            <WjTreeView
              :items-source="menuItems"
              displayMemberPath="path"
              childItemsPath="children"
              :initialized="onInitialized2"
              :isReadOnly="!currentMenu?.isWrite"
              :autoCollapse="false"
              :expandOnClick="true"
              :formatItem="onFormatItem"
              :nodeEditEnded="onNodeEditEnded"
              :isCollapsedChanging="onIsCollapsedChanging"
            >
            </WjTreeView>
          </div>
        </div>
      </template>
      <template #box3="{ props }">
        <div class="dx-card" :style="{ width: '100%', height: `${props.parentsHeight}px` }">
          <div class="dx-card-title">
            <div class="dx-card-title-text">{{ $t("Menu") }} {{ $t("Remove") }} {{ $t("List") }}</div>
            <div class="spacer"></div>
            <div class="dx-card-title-action"></div>
          </div>
          <div class="dx-card-text">
            <ul>
              <li v-for="item in removeItems">
                {{ item.name }} (<b>{{ item.menuId }}</b
                >, "{{ item.path }}")
              </li>
            </ul>
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
      container=".menu-manager"
      shading-color="rgba(0,0,0,0.4)"
      message="Please, wait..."
    />
  </div>
</template>

<script setup lang="ts">
import { Get, Save } from "../../stores/templateStore";
import { onMounted, ref, reactive, nextTick } from "vue";
import { useMutation, useQuery, useQueryClient } from "vue-query";

import { WjTreeView } from "@grapecity/wijmo.vue2.nav";
import {
  TreeView,
  TreeNodeDragDropEventArgs,
  FormatNodeEventArgs,
  DropPosition,
  TreeNodeEventArgs,
} from "@grapecity/wijmo.nav";

import "devextreme-vue/text-area";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { useTranslation } from "i18next-vue";
import { showMessage, showConfirm } from "../../utils/dialog";
import { Controller } from "../../components";
import DxButton from "devextreme-vue/button";
import DxTextBox from "devextreme-vue/text-box";
import DxSelectBox from "devextreme-vue/select-box";
import { systemId } from "../../utils/env";
import { EventArgs } from "@grapecity/wijmo";
import { SplitBox } from "@aleatorik-ui/vue-component-wijmo";
import { generateGUID } from "@aleatorik-ui/common-ui";

import { storeToRefs } from "pinia";
import { useMenuStore } from "../../stores/mainStore";

const menuModule = useMenuStore();
const { isEditing, currentMenu } = storeToRefs(menuModule);
const { t } = useTranslation();
interface IMenu {
  menuId: string;
  systemId: string;
  categoryId?: string;
  name: string;
  path: string;
  sequence: number;
  type: string;
  separator: boolean;
  children?: IMenu[];
  state: "loaded" | "added" | "removed";
}

const newItem = ref<IMenu>({
  menuId: "",
  systemId: systemId,
  name: "",
  path: "",
  sequence: 0,
  type: "Menu",
  separator: false,
  children: [],
  state: "added",
});
const newItemNo = ref(1);

const menuItems = ref<IMenu[] | null>([]);
const removeItems = ref<IMenu[] | null>([]);

const file = ref();

let treeView: TreeView | null = null;
let treeView2: TreeView | null = null;

const options = reactive({
  loading: false,
  filter: true,
  activeDelete: false,
  selectedType: null,
});
const queryClient = useQueryClient();

useQuery("Menu", ({ queryKey }) => Get(queryKey[0], systemId), {
  refetchOnWindowFocus: false,
  onSuccess: result => {
    menuModule.endEdit();
    removeItems.value = [];
    if (result && result.data) {
      const parseDatas = createMenuItems(
        result.data.map((d: IMenu) => {
          d.state = "loaded";
          return d;
        }),
      );
      menuItems.value = parseDatas;

      setTimeout(() => {
        treeView?.collapseToLevel(100000);
        treeView2?.collapseToLevel(100000);
      }, 100);
    } else menuItems.value = [];

    showMessage("Data load complete", true);
  },
  onError: err => {
    removeItems.value = [];
    showMessage("An error occurred while loading data", false);
    menuItems.value = [];
  },
});

const saveMenu = useMutation(param => Save("Menu", param), {
  onSuccess: result => {
    removeItems.value = [];
    if (result) showMessage(`Affected ${result.data} Row${result.data > 1 ? "s" : ""}`, result.data > 0);
    menuModule.endEdit();
  },
  onError: err => {
    removeItems.value = [];
    showMessage("An error occurred while saving data", false);
  },
});

onMounted(async () => {
  await loadData();
});

const onInitialized = (view: TreeView) => {
  treeView = view;
};
const onInitialized2 = (view: TreeView) => {
  treeView2 = view;
};

const loadData = async () => {
  options.loading = true;
  queryClient.invalidateQueries("Menu");
  options.loading = false;
};

const saveData = () => {
  const item = [...createFlatMenuItems(menuItems.value as any[]), ...(removeItems.value as any[])];
  saveMenu.mutateAsync(item as any);
};

const exportData = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(menuItems.value, null, 2)], {
      type: "application/json",
    }),
  );
  a.setAttribute("download", `${systemId}_menus.json`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const uploadFile = async (e: any) => {
  if (!file.value.length || !file.value.files.length) return;

  if (isEditing.value) {
    const result = await showConfirm({ message: "Current changes will be reset. continue?", title: "Import" });
    if (!result) return;
  }
  menuModule.endEdit();

  const reader = new FileReader();
  reader.onload = evt => {
    const text = evt.target?.result?.toString();
    if (!text || text.length === 0) return;

    const json = JSON.parse(text);
    if (!json || json.length === 0) return;

    menuItems.value?.forEach(item => {
      removeChildItem(item);
    });

    menuItems.value = json.map((item: any) => {
      item.menuMapId = generateGUID();
      return item;
    });

    setTimeout(() => {
      treeView?.collapseToLevel(100000);
      treeView2?.collapseToLevel(100000);
    }, 100);
  };
  reader.readAsText(file.value.files[0]);
};

const onFormatItem = (s: TreeView, e: FormatNodeEventArgs) => {
  if (e.dataItem.type !== "Category") return;
  e.element.style.fontWeight = "700";
};

const createMenuItems = (datas: IMenu[]): any[] => {
  try {
    const cloneDatas = JSON.parse(JSON.stringify(datas));
    cloneDatas
      .filter((cdata: IMenu) => cdata.categoryId && cdata.categoryId.length > 0)
      .forEach((cdata: IMenu) => {
        const parentData = datas.find(data => cdata.categoryId == data.menuId);
        const childIdx = datas.findIndex(data => cdata.menuId == data.menuId);
        if (!parentData || childIdx < 0) return;

        const childData = datas.splice(childIdx, 1);

        if (!parentData.children) parentData.children = [];

        parentData.children.push(...childData);
        parentData.children.sort((x, y) => x.sequence - y.sequence);
      });
    datas.sort((x, y) => x.sequence - y.sequence);
    return datas;
  } catch (e) {
    console.log(e);
  }
  return [];
};

const createFlatMenuItems = (datas: any[], categoryId: string = "", flatMenus: any[] = []): any[] => {
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

const addNodeFirst = async () => {
  if (!treeView) return;
  const result = await validateNewNode();
  if (result) return;

  const newMenu = JSON.parse(JSON.stringify(newItem.value));
  const node = treeView.selectedNode;
  const parent = node?.parentNode;

  if (!newMenu.path || newMenu.path.length === 0) {
    newMenu.path = `${parent && parent.dataItem.path !== "/" ? `${parent.dataItem.path}/` : `/${systemId}/`}${
      newMenu.menuId
    }`;
  }
  const targetNode = parent ? parent : treeView;
  const selectedNode = targetNode ? targetNode.addChildNode(0, newMenu) : treeView.addChildNode(0, newMenu);

  newItem.value = { ...newItem.value, menuId: "", name: "", path: "" };

  refresh(treeView);
  refresh(treeView2);
};

const addNodeLast = async () => {
  if (!treeView) return;
  const result = await validateNewNode();
  if (result) return;

  const newMenu = JSON.parse(JSON.stringify(newItem.value));
  const node = treeView.selectedNode;
  const parent = node?.parentNode;

  if (!newMenu.path || newMenu.path.length === 0) {
    newMenu.path = `${parent && parent.dataItem.path !== "/" ? `${parent.dataItem.path}/` : `/${systemId}/`}${
      newMenu.menuId
    }`;
  }
  const targetNode = parent ? parent : treeView;
  let index = targetNode && targetNode.nodes ? targetNode.nodes.length : treeView.nodes ? treeView.nodes.length : 0;
  const selectedNode = targetNode ? targetNode.addChildNode(index, newMenu) : treeView.addChildNode(index, newMenu);
  newItem.value = { ...newItem.value, menuId: "", name: "", path: "" };

  refresh(treeView);
  refresh(treeView2);
};

const addNodeNext = async () => {
  if (!treeView) return;
  const result = await validateNewNode();
  if (result) return;

  const newMenu = JSON.parse(JSON.stringify(newItem.value));
  const node = treeView.selectedNode;
  const parent = node?.parentNode;

  if (!newMenu.path || newMenu.path.length === 0) {
    newMenu.path = `${parent && parent.dataItem.path !== "/" ? `${parent.dataItem.path}/` : `/${systemId}/`}${
      newMenu.menuId
    }`;
  }
  const targetNode = parent ? parent : treeView;
  let index = node.index + 1;
  const selectedNode = targetNode ? targetNode.addChildNode(index, newMenu) : treeView.addChildNode(index, newMenu);
  newItem.value = { ...newItem.value, menuId: "", name: "", path: "" };

  refresh(treeView);
  refresh(treeView2);
};

const addNodeChild = async () => {
  if (!treeView) return;
  const result = await validateNewNode();
  if (result) return;

  const newMenu = JSON.parse(JSON.stringify(newItem.value));
  const node = treeView.selectedNode;

  if (!newMenu.path || newMenu.path.length === 0) {
    newMenu.path = `${node && node.dataItem.path !== "/" ? `${node.dataItem.path}/` : `/${systemId}/`}${
      newMenu.menuId
    }`;
  }
  const targetNode = node ? node : treeView;
  let index = targetNode && targetNode.nodes ? targetNode.nodes.length : treeView.nodes ? treeView.nodes.length : 0;
  const selectedNode = targetNode ? targetNode.addChildNode(index, newMenu) : treeView.addChildNode(index, newMenu);
  newItem.value = { ...newItem.value, menuId: "", name: "", path: "" };

  refresh(treeView);
  refresh(treeView2);
};

const removeSelectedNode = async () => {
  if (!treeView) return;

  const node = treeView.selectedNode;
  const result = await showConfirm({ message: `Remove ${node.dataItem.name}.\nContinue?`, title: "Remove" });
  if (!result) return;

  removeChildItem(node.dataItem);
  treeView.selectedNode?.remove();

  menuModule.beginEdit();
  refresh(treeView2);
};

const removeChildItem = (menu: IMenu) => {
  if (menu.children && menu.children.length > 0) {
    menu.children.forEach((child: IMenu) => {
      removeChildItem(child);
    });
  }

  if (menu.state === "loaded") {
    menu.state = "removed";
    removeItems.value?.push(menu);
  }
};

const validateNewNode = () => {
  return new Promise(async resolve => {
    const newMenu = newItem.value;
    if (!newMenu.menuId || newMenu.menuId.length === 0) {
      newMenu.menuId = generateGUID();
    }
    if (!newMenu.name || newMenu.name.length === 0) {
      newMenu.name = `New Menu ${newItemNo.value++}`;
    }
    if (menuItems.value && findMenuItem(menuItems.value, newMenu)) {
      showMessage("Already Resisted MenuId", false);
      return resolve(true);
    }
    return resolve(false);
  });
};

const findMenuItem = (menus: IMenu[], newItem: IMenu): boolean => {
  return menus?.some(menu => {
    if (menu.menuId === newItem.menuId) return true;
    if (menu.children && menu.children.length > 0) {
      return findMenuItem(menu.children, newItem);
    }
    return false;
  });
};

const onDragOver = (s: TreeView, e: TreeNodeDragDropEventArgs) => {
  if (e.dropTarget.dataItem.type !== "Category" && e.position == DropPosition.Into) {
    e.position = DropPosition.Before;
  }
};

const onDragEnd = (s: TreeView, e: EventArgs) => {
  menuModule.beginEdit();
  refresh(treeView2);
};

const onNodeEditEnded = () => {
  menuModule.beginEdit();
};

const onSelectedItemChanged = (s: TreeView, e: EventArgs) => {
  options.selectedType = s.selectedItem?.type;
};

const onIsCollapsedChanging = (s: TreeView, e: TreeNodeEventArgs) => {
  if (!e.node.isCollapsed) e.cancel = true;
};

const refresh = (view: TreeView | null) => {
  if (!view) return;

  view.itemsSource = [];
  view.itemsSource = menuItems.value as any[];
  view.refresh();

  nextTick(() => {
    view?.collapseToLevel(100000);
  });
};
</script>
<style>
.wj-node .wj-node-text {
  color: var(--color-font4);
}
</style>
