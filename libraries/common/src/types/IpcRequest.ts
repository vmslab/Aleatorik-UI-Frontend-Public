export default interface IpcRequest {
  responseChannel: string;
  requestChannel?: string;
  cancelChannel?: string;
  closeChannel?: string;
  params: any;
}
