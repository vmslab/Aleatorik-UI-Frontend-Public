import { Message } from "@lumino/messaging";
import { Signal } from "@lumino/signaling";
import { SplitPanel } from "@lumino/widgets";

export default class RestorableSplitPanel extends SplitPanel {
  updated: Signal<RestorableSplitPanel, void>;

  constructor(options: SplitPanel.IOptions = {}) {
    super(options);
    this.updated = new Signal(this);
  }

  /**
   * Emit 'updated' signal on 'update' requests.
   */
  protected onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
    this.updated.emit();
  }
}
