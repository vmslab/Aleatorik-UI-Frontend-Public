export default interface IProperty {
  name: string;
  origin: string;
  type: string;
  optional: boolean;
  key: boolean;
  input: string;
  hide: boolean;
  guid: boolean;
  edit: boolean;
  sort?: "asc" | "desc";
  cbotype?: string;
  cboitems?: string[];
  cboentity?: string;
  cbopropkey?: string;
  cbopropname?: string;
  cbowhereprop?: string;
  cbowherevalue?: string;
  relation?: string;
  relationKey?: string;
  relationType?: "OneToOne" | "OneToMany" | "ManyToOne" | "ManyToMany";
}
