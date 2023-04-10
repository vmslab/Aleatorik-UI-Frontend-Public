import IProperty from "./IProperty";

export default interface IClass {
  name: string;
  origin: string;
  categoryIo?: string;
  category?: string;
  schema: boolean;
  properties: IProperty[];
  deleteAndInsert?: boolean;
}
