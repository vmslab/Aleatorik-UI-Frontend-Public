import { LitElement, html, customElement, property, css, TemplateResult } from "lit-element";
import { get, set } from "lodash";
import { EventBus, INode, IEdge, IMargin, ICluster, FlowChart as FC } from "mozart-common";

@customElement("flow-chart")
export default class FlowChart extends LitElement {
  /**
   * Flow Chart의 Node List입니다.
   */
  @property({ type: Array }) public nodes?: INode[];
  /**
   * Flow Chart의 Edge List입니다.
   */
  @property({ type: Array }) public edges?: IEdge[];
  /**
   * Chart의 넓이입니다.<br>
   * 넓이를 설정하지 않을 경우 상위 Element의 넓이에 100%값이 됩니다.
   */
  @property({ type: Number }) public width!: number;
  /**
   * Chart의 높이입니다.<br>
   * 높이를 설정하지 않을 경우 상위 Element의 높이에 100%값이 됩니다.
   */
  @property({ type: Number }) public height!: number;
  /**
   * Edge Line의 색상입니다.
   */
  @property({ type: String }) public strokeColor: string = "#000";
  /**
   * 순수 그래프의 Margin값 입니다.<br>
   * top, right, bottom, left값을 지정할 수 있습니다.
   */
  @property({
    type: Object,
  })
  public margin: IMargin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  };

  protected chartBase!: FC;
  protected cls: any;

  private observer: ResizeObserver = new ResizeObserver(
    (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      this.draw();
    },
  );

  constructor() {
    super();

    this.chartBase = new FC();
    this.cls = FlowChart;
  }

  private get svg(): HTMLDivElement | null {
    const div = this.shadowRoot?.getElementById("svg");
    return div ? (div as HTMLDivElement) : null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.svg) {
      this.observer.observe(this.svg);
      this.draw();
    }
  }

  async attributeChangedCallback(name: string, old: string, value: string) {
    super.attributeChangedCallback(name, old, value);
    this.requestUpdate(name, old);
    await this.updateComplete;
    this.draw();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer.disconnect();
  }

  private getPropKeys(): string[] {
    const filters: string[] = ["data", "chartTitle"];
    const cps: Map<string, any> = get(this.cls, "_classProperties");
    const props: string[] = [];
    if (cps && cps.size > 0) {
      cps.forEach((value: any, key: string) => {
        if (!filters.includes(key)) {
          props.push(key);
        }
      });
    }
    return props;
  }

  private initProp() {
    this.getPropKeys().forEach(key => {
      set(this.chartBase, key, get(this, key));
    });
    this.chartBase.width = this.width || this.clientWidth;
    this.chartBase.height = this.height || this.clientHeight;
  }

  public draw() {
    // EventBus.fire("set-tooltip-funcs", { tooltipFuncs: this.tooltipFuncs });
    this.initProp();
    const svg = this.shadowRoot?.getElementById("svg");
    if (svg) {
      this.chartBase.draw(svg as any);
    }
  }

  render(): TemplateResult {
    return html` <div id="svg"></div> `;
  }
}
