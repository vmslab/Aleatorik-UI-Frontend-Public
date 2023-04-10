<script lang="ts">
import { CreateElement, VNode } from "vue";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import {
  Graph as GraphComponent,
  IGraphProps,
  ElementDefinition,
  ElementsDefinition,
  createCamelProps,
  IToolbarBtn,
} from "mozart-common";

@Component({
  name: "Graph",
  components: {},
})
export default class Graph extends Vue {
  /**
   * Graph의 데이터 입니다.<br>
   * node, edge를 모두 포합합니다.
   */
  @Prop({ type: [Object, Array] }) public elements?:
    | ElementsDefinition
    | ElementDefinition[]
    | Promise<ElementsDefinition>
    | Promise<ElementDefinition[]>;
  /**
   * Graph의 style 입니다.
   */
  @Prop({ type: [Object, Array] }) public styleObj?:
    | Array<Record<string, any>>
    | Promise<Array<Record<string, any>>>;
  /**
   * Graph의 layout 입니다.
   */
  @Prop({ type: Object }) public layout?: Record<string, any>;
  /**
   * Graph의 기본 설정 입니다.
   */
  @Prop({ type: Object }) public option?: Record<string, any>;
  /**
   * Graph의 Navigator 설정 입니다.
   */
  @Prop({ type: Object }) public navigator?: Record<string, any>;
  /**
   * Graph의 Undo & Redo 설정 입니다.
   */
  @Prop({ type: Object }) public undoRedo?: Record<string, any>;
  /**
   * Graph의 Utilities 설정 입니다.
   */
  @Prop({ type: Object }) public utilities?: Record<string, any>;
  /**
   * Graph의 Context menu 설정입니다.
   */
  @Prop({ type: Object }) public contextMenu?: Record<string, any>;
  /**
   * Graph의 Tooltip 설정입니다.
   */
  @Prop({ type: [Function, String] }) public tooltip?: Function | string;
  /**
   * Graph의 Container Element입니다.
   */
  @Prop({ type: HTMLElement }) public container?: HTMLElement;
  /**
   * Graph의 Click 이벤트입니다.
   */
  @Prop({ type: Function }) public onClick?: Function;
  /**
   * Graph의 Event Handler 설정입니다.
   */
  @Prop({ type: Object }) public eventHandlerList?: Record<string, Function>;
  /**
   * Graph의 toolbar custom button 입니다.
   */
  @Prop({ type: Array }) public customToolbarBtns?: IToolbarBtn[];

  public graph: GraphComponent | null = null;

  constructor() {
    super();
  }

  @Watch("styleObj", { deep: true })
  public onChangeStyle() {
    this.renderGraph();
  }

  @Watch("elements")
  public onChangeElements() {
    this.renderGraph();
  }

  @Watch("layout")
  public onChangeLayout() {
    this.renderGraph();
  }

  public renderGraph() {
    this.graph = new GraphComponent({
      parents: this.$refs.graph as unknown as HTMLElement,
      ...createCamelProps<IGraphProps>(this.$props),
    });
    this.graph.render();
    if (this.graph.updateTooltip && this.tooltip) {
      this.graph.updateTooltip(this.tooltip);
    }

    if (this.graph.addEventListner && this.eventHandlerList) {
      Object.keys(this.eventHandlerList).forEach((key: any) => {
        if (!key) return;
        if (!this.eventHandlerList) return;

        const handler = this.eventHandlerList[key];
        if (!handler) return;

        this.addEventListner(key, handler);
      });
    }
  }

  public mounted() {
    this.renderGraph();
  }

  public render(h: CreateElement): VNode {
    const props: any[] = [];
    Object.keys(this.$props).forEach(key => {
      props.push(this.$props[key]);
    });
    const children: any[] = [];
    children.push(...(this.$slots.default || []));
    return h(
      "div",
      {
        ref: "graph",
        class: "moz-graph-root",
      },
      children,
    );
  }

  public updateTooltip() {
    if (!this.graph) return;
    if (!this.graph.updateTooltip) return;
    this.graph.updateTooltip(this.tooltip);
  }

  public addEventListner(event: string, handler: Function) {
    if (!this.graph) return;
    if (!this.graph.addEventListner) return;
    this.graph.addEventListner(event, handler);
  }
}
</script>
