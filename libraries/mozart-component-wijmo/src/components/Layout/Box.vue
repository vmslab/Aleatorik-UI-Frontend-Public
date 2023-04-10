<script lang="ts">
import { CreateElement, VNode } from "vue";
import { Component, Prop, Vue } from "vue-property-decorator";
import { ScrollBar } from "mozart-common";

@Component({
  name: "Box",
  components: {},
})
export default class Box extends Vue {
  @Prop({ type: Number }) public width?: number;
  @Prop({ type: Number }) public height?: number;
  @Prop({ type: String }) public backgroundColor?: string;
  @Prop({ type: Boolean, default: false }) public scroll!: boolean;
  @Prop({ type: Boolean, default: true }) public auto!: boolean;

  constructor() {
    super();
  }

  public mounted() {
    if (this.scroll) {
      const box = this.$refs.box;
      new ScrollBar(box as HTMLElement, {
        autoHide: this.auto,
      });
    }
  }

  public render(h: CreateElement): VNode {
    const children: any[] = [];
    children.push(
      (this.$scopedSlots as any).default({
        parentsWidth: this.width,
        parentsHeight: this.height,
      }),
    );
    return h(
      "div",
      {
        style: {
          width: `${this.width}px`,
          height: `${this.height}px`,
          minWidth: `${this.width}px`,
          minHeight: `${this.height}px`,
          backgroundColor: this.backgroundColor,
          // overflow: this.scroll ? "auto" : "visible",
        },
        ref: "box",
      },
      children,
    );
  }
}
</script>
