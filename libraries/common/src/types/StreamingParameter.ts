export default class StreamingParameter<Req, Res> {
  public sessionId: string;
  public params: Req;
  public isComplate: boolean = false;

  public onRecived?: (param: Res) => void;
  public onClosed?: () => void;

  public onCancelClick?: (param: Req) => void;
  public onRequestClick?: (param: Req) => void;

  constructor(sessionId: string, params: Req) {
    this.sessionId = sessionId;
    this.params = params;
  }

  public get ipcObject(): Req {
    return this.params;
  }

  public recived(param: Res) {
    if (this.onRecived) {
      this.onRecived(param);
    }
  }

  public closed() {
    if (this.onClosed) {
      this.onClosed();
    }
  }
}
