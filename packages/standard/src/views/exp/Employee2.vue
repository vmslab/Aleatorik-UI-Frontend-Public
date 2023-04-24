<template>
  <Controller
    :show-filter-button="true"
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
    <template #filter>
      <div>
        <label>{{ $t('부서') }}</label>
        <WjMultiSelect
          ref="deptSelect"
          placeholder="부서 선택"
          :showSelectAllCheckbox="true"
          :itemsSource="deptList"
          :itemsSourceChanged="onItemsSourceChanged"
          :checkedItemsChanged="onCheckedItemsChanged"
        ></WjMultiSelect>
      </div>
    </template>
  </Controller>
  <div class="moz-frame-for-outer-control">
    <WjFlexGrid
      style="width: 100%; height: calc(var(--size-content-inner-height-outer-controller) - 4px)"
      :autoGenerateColumns="false"
      :alternatingRowStep="0"
      :itemsSource="filteredSource"
      :initialized="onInitialized"
      :selectionChanged="onSelectionChanged"
      :isReadOnly="!currentMenu?.isWrite"
      :beginningEdit="beginningEdit"
      :pastingCell="pastingCell"
    >
      <WjFlexGridColumn :width="100" binding="empNO" :header="$t('사번')" :isRequired="true" />
      <WjFlexGridColumn :width="100" binding="empName" :header="$t('이름')" :isRequired="true" />
      <WjFlexGridColumn :width="250" binding="department" :header="$t('부서')" />
      <WjFlexGridColumn :width="150" binding="phoneNO" :header="$t('연락처')" format="(999) 000-0000" :editor="phoneEditor" />
      <WjFlexGridColumn
        :width="100"
        binding="hireDate"
        :header="$t('입사일')"
        dataType="Date"
        format="yyyy-MM-dd"
        align="center"
        :editor="dateEditor"
      />
      <WjFlexGridColumn
        :width="100"
        binding="birthDate"
        :header="$t('생일')"
        dataType="Date"
        format="yyyy-MM-dd"
        align="center"
        :editor="dateEditor"
      />
      <WjFlexGridColumn :width="100" binding="salary" :header="$t('연봉')" dataType="Number" format="c0" />
      <WjFlexGridColumn :width="200" binding="createUser" :header="$t('생성자')" :isRequired="true" :isReadOnly="true" />
      <WjFlexGridColumn
        :width="200"
        binding="createDatetime"
        :header="$t('생성일')"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
        align="center"
        :isRequired="true"
        :isReadOnly="true"
      />
    </WjFlexGrid>

    <LoadPanel :loading="options.loading" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue';
import { useQuery, useQueryClient, useMutation } from 'vue-query';
import { ExtendGrid } from '@aleatorik-ui/vue-component-wijmo';
import { WjFlexGrid, WjFlexGridColumn } from '@grapecity/wijmo.vue2.grid';
import { WjMultiSelect } from '@grapecity/wijmo.vue2.input';
import { FlexGrid } from '@grapecity/wijmo.grid';
import { InputDateTime, InputMask, MultiSelect } from '@grapecity/wijmo.input';

import { useTranslation } from 'i18next-vue';
import { showDialog, showMessage } from '../../utils/dialog';
import { storeToRefs } from 'pinia';
import { useMenuStore, useUserStore } from '../../stores/mainStore';
import { Call } from '../../stores/queryStore';

import Controller from '../../components/Controller.vue';
import LoadPanel from '../../components/LoadPanel.vue';
import { disableKeyColumnEdit } from '../../utils/commonFunc';
import { EventArgs } from '@grapecity/wijmo';

/**
 * CONSTANT
 */
const menuModule = useMenuStore();
const { isEditing, currentMenu } = storeToRefs(menuModule);
const userModule = useUserStore();
const { email } = storeToRefs(userModule);

const { t } = useTranslation(); // 다국어
const queryClient = useQueryClient();

const dateEditor = ref<InputMask>(
  new InputMask(document.createElement('div'), {
    mask: '9999-99-99'
  })
);

const phoneEditor = ref<InputMask>(
  new InputMask(document.createElement('div'), {
    mask: '(999) 0000-0000'
  })
);

/**
 * STATE
 */
const options = reactive({
  loading: false,
  filter: true,
  activeDelete: false,
  checkedItems: [] as any[]
});

const filteredSource = computed(() => dataSource?.value?.filter(d => options.checkedItems.includes(d.department)));
const dataSource = ref<any[] | null>([]); // data list
const grid = ref<FlexGrid | null>(null);
const extendGrid = ref<ExtendGrid | null>(null);
const gridKeys: string[] = ['empNo'];

const deptSelect = ref();
const deptList = ref<string[] | null>([]);

/**
 * Initialize
 */
onMounted(async () => {
  await loadData();
});

// select box initialize
const onDeptInitialized = (e: any) => {};

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
        let empNOList: number[] = [999];
        if (flexGrid && flexGrid.collectionView.sourceCollection) {
          empNOList = flexGrid.collectionView.sourceCollection.map((d: any) => d.empNO);
        }
        return {
          empNO: (Math.max(...empNOList) + 1).toString(),
          _isAdded: true,
          createUser: email.value,
          createDatetime: new Date()
        };
      }
    }
  });
};

// data loaded cache reset and reload
const loadData = async () => {
  options.loading = true;
  queryClient.invalidateQueries('TrDepartment');
  queryClient.invalidateQueries('TrEmployee');
  extendGrid.value?.clearChanges();
  onCellEditEnded();
  options.loading = false;
};

/**
 * API Call
 */
// data load api
useQuery('TrDepartment', ({ queryKey }) => Call(`TrDepartment?createUser=${email.value}`), {
  refetchOnWindowFocus: false,
  onSuccess: result => {
    menuModule.endEdit();

    if (result && result.data) deptList.value = result.data;
    else deptList.value = [];
  },
  onError: err => {
    showMessage('An error occurred while loading data', false);
    deptList.value = [];
  }
});

// data load api
useQuery('TrEmployee', ({ queryKey }) => Call(`TrEmployee?createUser=${email.value}`), {
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
const addQuery = useMutation(param => Call('TrEmployee', param, 'POST'), {
  onSuccess: result => {
    // console.log("addQuery success", result);
  },
  onError: err => {
    showMessage(t(`addError`), false);
  }
});

// data modify api
const modifyQuery = useMutation((param: any) => Call(`TrEmployee/${param?.empNo}`, param, 'PUT'), {
  onSuccess: result => {
    // console.log("modifyQuery success", result);
  },
  onError: err => {
    showMessage(t(`UpdateError`), false);
  }
});

// data remove api
const removeQuery = useMutation((param: any) => Call(`TrEmployee/${param?.empNo}`, param, 'DELETE'), {
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
            id: _rows[0]?.dataItem?.siteID
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
const onItemsSourceChanged = (s: MultiSelect, e: EventArgs) => {
  s.itemsSource.forEach((item: any) => {
    s.checkedItems.push(item);
  });

  s.invalidate();
  onCheckedItemsChanged(s);
};

const onCheckedItemsChanged = (s: any) => {
  options.checkedItems = s.checkedItems;
};

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

const pastingCell = (grid: any, e: any) => {
  disableKeyColumnEdit(grid, e, gridKeys);
};

const beginningEdit = (grid: any, e: any) => {
  disableKeyColumnEdit(grid, e, gridKeys);
};
</script>
