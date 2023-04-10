<script lang="ts">
import { CreateElement, VNode } from "vue";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import lottie, { AnimationItem } from "lottie-web";

@Component({
  name: "Lottie",
  components: {},
})
export default class Lottie extends Vue {
  @Prop({ type: Object, required: true }) public data?: any;
  @Prop({ type: Number, default: 0 }) public height!: number;
  @Prop({ type: Number, default: 0 }) public width!: number;
  @Prop({ type: Boolean, default: true }) public loop!: boolean;
  @Prop({ type: Boolean, default: true }) public autoplay!: boolean;
  @Prop({ type: Number, default: 1 }) public speed!: number;
  @Prop({ type: Object }) public options!: object;

  public anim?: AnimationItem;

  constructor() {
    super();
  }

  public get style(): object {
    return {
      width: this.width ? `${this.width}px` : "100%",
      height: this.height ? `${this.height}px` : "100%",
      overflow: "hidden",
    };
  }

  public mounted() {
    if (!this.data) return;
    this.anim = lottie.loadAnimation({
      container: this.$refs.container as Element,
      renderer: "svg",
      loop: this.loop !== false,
      autoplay: this.autoplay !== false,
      animationData: this.data,
      rendererSettings: this.options,
    });
    this.anim.setSpeed(this.speed);
    this.$emit("created", this.anim);
  }

  public render(h: CreateElement): VNode {
    const props: any[] = [];
    Object.keys(this.$props).forEach(key => {
      props.push(this.$props[key]);
    });
    return h("div", {
      ref: "container",
      style: this.style,
    } as any);
  }
}
</script>
