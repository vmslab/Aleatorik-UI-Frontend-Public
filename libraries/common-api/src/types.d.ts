export interface IMenu {
  menuId: string;
  name: string;
  categoryId?: string;
  type: "Category" | "Menu";
  path?: string;
}
