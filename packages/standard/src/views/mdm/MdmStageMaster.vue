<template>
  <Controller
    :show-filter-button="false"
    :actions="[
      {
        action: 'Add',
        click: () => {
          extendGrid?.addRow();
        }
      },
      {
        action: 'Remove',
        click: onRemove
      },
      {
        action: 'Save',
        disabled: !isEditing,
        click: onSave
      },
      {
        action: 'Search',
        click: () => {
          loadData();
        }
      }
    ]"
  >
  </Controller>
  <div class="moz-frame-for-outer-control">
    <WjFlexGrid
      style="width: 100%; height: calc(var(--size-content-inner-height-outer-controller) - 4px)"
      :autoGenerateColumns="false"
      :alternatingRowStep="0"
      :itemsSource="dataSource"
      :initialized="onInitialized"
      :selectionChanged="onSelectionChanged"
      :isReadOnly="!currentMenu?.isWrite"
      :beginningEdit="beginningEdit"
    >
      <WjFlexGridColumn :width="200" binding="stageID" :header="$t('stageID')" :isRequired="true" />
      <WjFlexGridColumn :width="200" binding="description" :header="$t('description')" />
      <WjFlexGridColumn
        :width="150"
        binding="createTime"
        :header="$t('CreateTime')"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
        align="center"
        :isReadOnly="true"
      />
      <WjFlexGridColumn :width="200" binding="createUser" :header="$t('CreateUser')" :isReadOnly="true" />
      <WjFlexGridColumn
        :width="150"
        binding="updateTime"
        :header="$t('UpdateTime')"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
        align="center"
        :isReadOnly="true"
      />
      <WjFlexGridColumn :width="200" binding="updateUser" :header="$t('UpdateUser')" :isReadOnly="true" />
    </WjFlexGrid>

    <LoadPanel :loading="options.loading" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { useQuery, useQueryClient, useMutation } from 'vue-query';
import { ExtendGrid } from '@aleatorik-ui/vue-component-wijmo';
import { WjFlexGrid, WjFlexGridColumn } from '@grapecity/wijmo.vue2.grid';
import { FlexGrid } from '@grapecity/wijmo.grid';
import { InputDateTime } from '@grapecity/wijmo.input';

import { useTranslation } from 'i18next-vue';
import { showDialog, showMessage } from '../../utils/dialog';
import { storeToRefs } from 'pinia';
import { useMenuStore } from '../../stores/mainStore';
import { Call } from '../../stores/queryStore';

import Controller from '../../components/Controller.vue';
import LoadPanel from '../../components/LoadPanel.vue';
import { disableKeyColumnEdit } from '../../utils/commonFunc';

/**
 * CONSTANT
 */
const menuModule = useMenuStore();
const { isEditing, currentMenu } = storeToRefs(menuModule);

const { t } = useTranslation(); // 다국어
const queryClient = useQueryClient();

const dateEditor = ref<InputDateTime>(
  new InputDateTime(document.createElement('div'), {
    format: 'yyyy-MM-dd HH:mm:ss'
  })
);

/**
 * STATE
 */
const options = reactive({
  loading: false,
  filter: true,
  activeDelete: false,
  checkedItems: [{ value: false }, { value: true }] as any[]
});

const dataSource = ref<any[] | null>([]); // data list
const grid = ref<FlexGrid | null>(null);
const extendGrid = ref<ExtendGrid | null>(null);
const gridKeys: string[] = ['stageID'];

/**
 * Initialize
 */
onMounted(async () => {
  await loadData();
});

// grid initialize
const onInitialized = (flexGrid: FlexGrid) => {
  grid.value = flexGrid;
  extendGrid.value = new ExtendGrid({
    flexGrid,
    dataOptions: {
      dataKey: gridKeys,
      validateKey: 'save'
    },
    gridOptions: {
      useParseDate: true,
      onInitialized(extendGrid) {
        loadData();
      },
      onInitialzeRowData() {
        return {
          _isAdded: true
        };
      }
    }
  });
};

// data loaded cache reset and reload
const loadData = async () => {
  options.loading = true;
  queryClient.invalidateQueries('MdmStageMaster');
  extendGrid.value?.clearChanges();
  onCellEditEnded();
  options.loading = false;
};

/**
 * API Call
 */
// data load api
useQuery('MdmStageMaster', ({ queryKey }) => Call('MdmStageMaster'), {
  refetchOnWindowFocus: false,
  onSuccess: result => {
    menuModule.endEdit();

    if (result && result.data) dataSource.value = result.data;
    else dataSource.value = [];
  },
  onError: err => {
    showMessage('An error occurred while loading data', false);
    dataSource.value = [];
  }
});

// data add api
const addQuery = useMutation(param => Call('MdmStageMaster', param, 'POST'), {
  onSuccess: result => {
    // console.log("addQuery success", result);
  },
  onError: err => {
    showMessage(t(`addError`), false);
  }
});

// data modify api
const modifyQuery = useMutation((param: any) => Call(`MdmStageMaster/${param?.stageID}`, param, 'PUT'), {
  onSuccess: result => {
    // console.log("modifyQuery success", result);
  },
  onError: err => {
    showMessage(t(`UpdateError`), false);
  }
});

// data remove api
const removeQuery = useMutation((param: any) => Call(`MdmStageMaster/${param?.stageID}`, param, 'DELETE'), {
  onSuccess: result => {
    // console.log("removeQuery success", result);
  },
  onError: err => {
    showMessage(t(`RemoveError`), false);
  }
});

/**
 * Callback
 */
const onRemove = async () => {
  const _rows = extendGrid.value?.flexGrid.selectedRows || [];

  if (_rows?.length <= 0) {
    showMessage(t('SelectRowForRemove'), false);
    return false;
  }

  const result = await showDialog({
    type: 'warning',
    action: 'confirm',
    message:
      _rows.length > 1
        ? t(`confirmDeleteMultiRows`, {
            count: _rows.length
          })
        : t(`confirmDeleteSingleRow`, {
            id: _rows[0]?.dataItem?.stageID
          })
  });

  if (result) {
    const row = _rows.map(row => row.dataItem);
    for await (const item of row) {
      await removeQuery.mutateAsync(item);
    }
    showMessage(t(`RemoveSuccess`), true);

    loadData();
  }
};

const onSave = async () => {
  const { addedItems, updatedItems } = await extendGrid?.value?.getChangedData()!;

  if (addedItems?.length > 0) {
    for await (const item of addedItems) {
      delete item.data._isAdded;
      await addQuery.mutateAsync(item.data);
    }
    showMessage(t(`AddSuccess`), true);
  }

  if (updatedItems?.length > 0) {
    for await (const item of updatedItems) {
      await modifyQuery.mutateAsync(item.data);
    }
    showMessage(t(`UpdateSuccess`), true);
  }

  await extendGrid.value?.setChangeCommit();
  onCellEditEnded();
};

/**
 * Event
 */
const onSelectionChanged = () => {
  const flexGrid = grid.value;
  if (!flexGrid) return;
  const selectedRows = flexGrid.rows.filter((r: any) => r.isVisible && r.isSelected);
  const flag = selectedRows.length > 0;
  if (options.activeDelete != flag) options.activeDelete = flag;

  onCellEditEnded();
};

const onCellEditEnded = () => {
  const exGrid = extendGrid.value;
  if (!exGrid) return;
  const flag = exGrid.isEditing;
  if (isEditing.value != flag) menuModule.setIsEditing(flag);
};

const beginningEdit = (grid: any, e: any) => {
  disableKeyColumnEdit(grid, e, gridKeys);
};
</script>
