export const standard = {
  tableName: "CFG_SALES_ORDER",
  dataKey: "SO_ID",
  viewType: "crud",
  // columnSetting: `SO_ID,
  //   STAGE_ID,
  //   ITEM_ID,
  //   SITE_ID,
  //   BUFFER_ID,
  //   DUE_DATE:Date,
  //   QTY:Number,
  //   PRIORITY,
  //   CUSTOMER_ID,
  //   DEMAND_TYPE,
  //   MAX_LATENESS_DAYS:Number,
  //   MAX_EARLINESS_DAYS:Number,
  //   IS_RTF_TARGET,
  //   CREATE_TIME:Date;생성일,
  //   CREATE_USER,
  //   UPDATE_TIME:Date;수정일,
  //   UPDATE_USER`,
  useMngProperty: true,
  isReadOnly: false,
};

export const version = {
  // tableName: "OUT_PRODUCTION_PLAN",
  // dataKey: "PLAN_VERSION,MODULE_KEY,PLAN_SEQ,LOT_ID",
  tableName: "ODV_SALES_ORDER",
  dataKey: "PLAN_VERSION,SO_ID",
  viewType: "crud",
  useMngProperty: true,
  hideVersion: true,
  isReadOnly: false,
};

export const virtual = {
  tableName: "ODV_SALES_ORDER",
  dataKey: "PLAN_VERSION,SO_ID",
  viewType: "crud",
  useMngProperty: true,
  hideVersion: true,
  isReadOnly: false,
};

export default {
  standard,
  version,
  virtual,
};
