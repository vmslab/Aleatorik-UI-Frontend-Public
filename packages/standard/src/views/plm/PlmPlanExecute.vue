<template>
  <Controller
    :show-filter-button="true"
    :actions="[
      {
        action: 'Run',
        click: () => {
          popup?.toggle();
        }
      },
      {
        action: 'Remove',
        click: onRemove
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
        <label>{{ $t('FromDate') }}</label>
        <WjInputDate :value="options.fromDate.toDate()" format="yyyy-MM-dd" />
      </div>
      <div>
        <Button :text="$t('1주일')" @click="setDateWeekBefore" />
      </div>
      <div>
        <Button :text="$t('1개월')" @click="setDateMonthBefore" />
      </div>
      <div>
        <Button :text="$t('3개월')" @click="setDate3MonthBefore" />
      </div>
    </template>
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
      <WjFlexGridColumn :width="200" binding="planVer" :header="$t('planVer')" :isRequired="true" />
      <WjFlexGridColumn :width="200" binding="planStartDate" :header="$t('planStartDate')" />
      <WjFlexGridColumn :width="200" binding="planPeriod" :header="$t('planPeriod')" />
      <WjFlexGridColumn :width="200" binding="scenarioID" :header="$t('scenarioID')" />
      <WjFlexGridColumn :width="200" binding="planType" :header="$t('planType')" />
      <WjFlexGridColumn :width="200" binding="executionType" :header="$t('executionType')" />
      <WjFlexGridColumn :width="200" binding="description" :header="$t('description')" />
      <WjFlexGridColumn :width="200" binding="createUser" :header="$t('createUser')" />
      <WjFlexGridColumn
        :width="150"
        binding="inboundStartDatetime"
        :header="$t('inboundStartDatetime')"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
        align="center"
        :isReadOnly="true"
      />
      <WjFlexGridColumn
        :width="150"
        binding="inboundEndDatetime"
        :header="$t('inboundEndDatetime')"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
        align="center"
        :isReadOnly="true"
      />
      <WjFlexGridColumn
        :width="150"
        binding="engineStartDatetime"
        :header="$t('engineStartDatetime')"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
        align="center"
        :isReadOnly="true"
      />
      <WjFlexGridColumn
        :width="150"
        binding="engineEndDatetime"
        :header="$t('engineEndDatetime')"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
        align="center"
        :isReadOnly="true"
      />
    </WjFlexGrid>

    <LoadPanel :loading="options.loading" />
  </div>

  <!-- <WjPopup :initialized="initPopup">asf </WjPopup> -->
  <Popup title="popup title" ref="popup" :width="500" action="run" :callback="onClosePopup" class="plan_popup">
    <Input :label="$t('planID')" v-model="edit.planID" width="100%" />
    <Input
      :label="$t('scenarioID')"
      v-model="edit.scenarioID"
      type="dropdownlist"
      :list="['Ringo', 'George', 'John', 'Paul']"
      width="100%"
    />
    <Input :label="$t('planStartDate')" v-model="edit.planStartDate" type="date" width="100%" />
    <Input :label="$t('planPeriod')" v-model="edit.planPeriod" type="number" width="100%" />
    <Input :label="$t('planPeriod')" v-model="edit.planPeriod" type="number" width="100%" :min="0" :step="10" />
    <Input :label="$t('description')" v-model="edit.description" type="textarea" width="100%" :height="70" />
  </Popup>
</template>
<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { useQuery, useQueryClient, useMutation } from 'vue-query';
import { ExtendGrid } from '@aleatorik-ui/vue-component-wijmo';
import { WjFlexGrid, WjFlexGridColumn } from '@grapecity/wijmo.vue2.grid';
import { WjInputDate, WjPopup, WjInputMask, WjInputNumber } from '@grapecity/wijmo.vue2.input';
import { FlexGrid } from '@grapecity/wijmo.grid';

import { useTranslation } from 'i18next-vue';
import { showDialog, showMessage } from '../../utils/dialog';
import { storeToRefs } from 'pinia';
import { useMenuStore } from '../../stores/mainStore';
import { Call } from '../../stores/queryStore';

import Controller from '../../components/Controller.vue';
import LoadPanel from '../../components/LoadPanel.vue';
import Button from '../../components/Button.vue';
import Input from '@/components/Input.vue';
import { Popup } from '@/components';

import { disableKeyColumnEdit } from '../../utils/commonFunc';

import dayjs from 'dayjs';

/**
 * define CONSTANT
 */
const menuModule = useMenuStore();
const { isEditing, currentMenu } = storeToRefs(menuModule);

const { t } = useTranslation(); // 다국어
const queryClient = useQueryClient();

/**
 * STATE
 */
const options = reactive({
  loading: false,
  filter: true,
  activeDelete: false,
  fromDate: dayjs().add(-1, 'month').startOf('day')
});

const popup: any = ref(null);

const dataSource = ref<any[] | null>([]); // data list
const grid = ref<FlexGrid | null>(null);
const extendGrid = ref<ExtendGrid | null>(null);
const gridKeys: string[] = ['allocGroupID'];

const edit = reactive({
  planID: '',
  scenarioID: '',
  planStartDate: dayjs().add(-1, 'month').startOf('day'),
  planPeriod: 0,
  description: ''
});

/**
 * Initialize
 */
onMounted(async () => {
  // await loadData();
});

// popup initalize
const initPopup = (popup: any) => {
  options.popup = popup;
};

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
  queryClient.invalidateQueries('MdmAllocGroupMaster');
  extendGrid.value?.clearChanges();
  onCellEditEnded();
  options.loading = false;
};

/**
 * API Call
 */
// data load api
// useQuery('MdmAllocGroupMaster', ({ queryKey }) => Call('MdmAllocGroupMaster'), {
//   refetchOnWindowFocus: false,
//   onSuccess: result => {
//     menuModule.endEdit();

//     if (result && result.data) dataSource.value = result.data;
//     else dataSource.value = [];
//   },
//   onError: err => {
//     showMessage('An error occurred while loading data', false);
//     dataSource.value = [];
//   }
// });

// data add api
const addQuery = useMutation(param => Call('MdmAllocGroupMaster', param, 'POST'), {
  onSuccess: result => {
    // console.log("addQuery success", result);
  },
  onError: err => {
    showMessage(t(`addError`), false);
  }
});

// data modify api
const modifyQuery = useMutation((param: any) => Call(`MdmAllocGroupMaster/${param?.allocGroupID}`, param, 'PUT'), {
  onSuccess: result => {
    // console.log("modifyQuery success", result);
  },
  onError: err => {
    showMessage(t(`UpdateError`), false);
  }
});

// data remove api
const removeQuery = useMutation((param: any) => Call(`MdmAllocGroupMaster/${param?.allocGroupID}`, param, 'DELETE'), {
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
            id: _rows[0]?.dataItem?.allocGroupID
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

const setDateWeekBefore = () => {
  options.fromDate = dayjs().add(-1, 'week').startOf('day');
};
const setDateMonthBefore = () => {
  options.fromDate = dayjs().add(-1, 'month').startOf('day');
};
const setDate3MonthBefore = () => {
  options.fromDate = dayjs().add(-3, 'month').startOf('day');
};

const onClosePopup = (result: boolean) => {
  console.log('custom', result);
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
<style lang="scss">
.plan_popup {
  .moz-dialog-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: var(--size-padding5);
    row-gap: var(--size-padding8);
    padding: var(--size-padding9) var(--size-padding7);

    .moz-input:last-child {
      grid-column: 1/3;
    }
  }
}
</style>
