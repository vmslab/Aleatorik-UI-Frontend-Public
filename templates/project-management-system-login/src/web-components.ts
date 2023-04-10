export interface IWebComponent {
  id: string;
  name?: string;
  category?: string;
  description?: string;
}

export const defineWebComponents = (ws: IWebComponent, cb: any) => {
  cb(`${process.env.VUE_APP_PLUGIN_NAME}-${ws.id}`);
};
