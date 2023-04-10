<script lang="ts">
import { CreateElement, VNode } from "vue";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  name: "Spliter",
  components: {},
})
export default class Spliter extends Vue {
  @Prop({ type: Number }) public width?: number;
  @Prop({ type: Number }) public height?: number;
  @Prop({ type: Boolean, default: false }) public horizontal!: boolean;
  @Prop({ type: String }) public backgroundColor?: string;
  @Prop({ type: Boolean }) public resizable?: boolean;
  @Prop({ type: Function }) public onMouseDown?: any;
  @Prop({ type: Function }) public onClick?: (event: MouseEvent) => {};

  constructor() {
    super();
  }

  public get cursor(): string {
    if (this.resizable) {
      return this.horizontal ? "col-resize" : "row-resize";
    }
    return "default";
  }

  public render(h: CreateElement): VNode {
    return h("div", {
      style: {
        width: `${this.width}px`,
        height: `${this.height}px`,
        minWidth: `${this.width}px`,
        minHeight: `${this.height}px`,
        backgroundColor: this.backgroundColor,
        cursor: this.cursor,
      },
      on: {
        mousedown: this.onMouseDown,
        // click: this.onClick,
      }
    });
  }
}
</script>
