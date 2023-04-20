/*!
 * Create a new object composed of properties picked from another object
 * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Object} obj   The object to pick properties from
 * @param  {Array}  props An array of properties to use
 * @return {Object}       The new object
 */
export const pick = (obj: any, keys: string[]) => {
  // Create new object
  let picked: any = {};

  // Loop through props and push to new object
  for (let key of keys) {
    picked[key] = obj[key];
  }

  // Return new object
  return picked;
};

/**
 * Wijmo Grid 이벤트에서 실제 데이터를 가진 셀인지 확인하는 함수
 * @param grid FlexGrid
 * @param e Event
 * @returns
 */
export const isDataCell = (grid: any, e: any) => {
  return grid.cells === e.panel;
};

/**
 * 그리드 키 컬럼에 대해 새로 추가된 row만 수정 가능하고 기존 row는 수정할 수 없게 하는 함수
 * @param grid
 * @param e
 */
export const disableKeyColumnEdit = (grid: any, e: any, gridKeys: string[]) => {
  if (grid.rows[e.row].dataItem?._isAdded !== true && gridKeys.includes(e.getColumn().binding)) {
    e.cancel = true;
  }
};
