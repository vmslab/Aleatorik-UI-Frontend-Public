import { LitElement, html, customElement, property, css, TemplateResult } from "lit-element";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("my-element")
export default class MyElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
  `;

  /**
   * The name to say "Hello" to.
   */
  @property({ type: String })
  name = "World";

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0;

  connectedCallback() {
    super.connectedCallback();
  }

  attributeChangedCallback(name: string, old: string, value: string) {
    super.attributeChangedCallback(name, old, value);
    console.log(`${name}, ${old}, ${value}`);
    this.requestUpdate(name, old);
  }

  render(): TemplateResult {
    return html`
      <h1>Hello, ${this.name}!</h1>
      <button @click=${this.onClick} part="button">Click Count: ${this.count}</button>
      <slot></slot>
    `;
  }

  private onClick(): void {
    this.count++;
    this.requestUpdate();
  }
}
