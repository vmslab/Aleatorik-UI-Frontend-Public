import { MergeManager, CellRange, GridPanel } from "@grapecity/wijmo.grid";

export default class CustomMergeManager extends MergeManager {
  private targetColumns?: Array<string> | boolean;
  private preAffected?: boolean;

  constructor(targetColumns?: Array<string> | boolean, preAffected: boolean = false) {
    super();

    this.targetColumns = targetColumns;
    this.preAffected = preAffected;
  }

  getMergedRange(panel: GridPanel, r: any, c: any, clip = true) {
    const column = panel.columns[c];
    if (!column.binding) return null;

    const viewRange = panel.viewRange;
    // const topRow = viewRange.topRow < 1 ? 1 : viewRange.topRow;
    const topRow = viewRange.topRow;
    if (r > viewRange.bottomRow || r < topRow) return null;
    if (c < viewRange.col || c > viewRange.col2) return null;

    //
    // create basic cell range
    let rng = new CellRange(r, c);
    let preRng = new CellRange(r, c > 0 ? c - 1 : c);

    if (this.targetColumns) {
      if (typeof this.targetColumns === "object") {
        const findIdx = this.targetColumns.indexOf(column.binding);
        if (findIdx < 0) {
          return null;
        } else if (findIdx > 0) {
          let preColumn = this.targetColumns[findIdx - 1];
          if (preColumn) {
            const preColIdx = panel.columns.findIndex(col => col.binding === preColumn);
            console.log(preColumn, preColIdx);
            preRng = new CellRange(r, preColIdx);
          }
        } else {
          preRng = rng;
        }
      }
    }
    //
    // expand up/down
    if (rng.row2 > viewRange.bottomRow) rng.row2 = viewRange.bottomRow;
    else {
      for (let i = rng.row; i < viewRange.bottomRow; i++) {
        if (panel.getCellData(i, rng.col, true) !== panel.getCellData(i + 1, rng.col, true)) break;
        if (
          this.preAffected &&
          panel.getCellData(i, preRng.col, true) !== panel.getCellData(i + 1, preRng.col, true)
        )
          break;
        rng.row2 = i + 1;
      }
    }
    if (rng.row < topRow) rng.row = topRow;
    else {
      for (let i = rng.row; i > topRow; i--) {
        if (panel.getCellData(i, rng.col, true) != panel.getCellData(i - 1, rng.col, true)) break;
        if (
          this.preAffected &&
          panel.getCellData(i, preRng.col, true) != panel.getCellData(i - 1, preRng.col, true)
        )
          break;
        rng.row = i - 1;
      }
    }

    if (rng.row2 - rng.row > 0) {
      panel.getCellElement(rng.row, rng.col)?.classList.add("wj-merge");
    }
    //
    // done
    return rng;
  }
}
