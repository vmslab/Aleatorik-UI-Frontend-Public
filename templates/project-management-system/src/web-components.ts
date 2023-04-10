export interface IWebComponent {
  id: string;
  name?: string;
  category?: string;
  description?: string;
  params?: IWebParameter[];
}

export interface IWebParameter {
  key: string;
  type: string;
}

export const defineWebComponents = (ws: IWebComponent, cb: any) => {
  cb(`${process.env.VUE_APP_PLUGIN_NAME}-${ws.id}`);
};
