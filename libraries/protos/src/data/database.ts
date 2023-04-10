export const providers = [
  { name: "Oracle", icon: "m-181_icon-oracle", type: 1 },
  { name: "SqlServer", icon: "m-180_icon-sqlserver", type: 0 },
  { name: "MariaDB", icon: "m-179_icon-mariadb", type: 0 },
  { name: "PostgreSQL", icon: "m-178_icon-postgresql", type: 0 },
  { name: "SQLite", icon: "m-177_icon-sqlite", type: 2 },
];

export const getIconFromProvider = (provider: string) => {
  const item = providers.find(x => x.name.toLowerCase() === provider.toLowerCase());
  if (!item) return "";
  return item.icon;
};

export const types: string[] = [
  "string",
  "bool",
  "int",
  "long",
  "short",
  "float",
  "double",
  "decimal",
  "date",
  "time",
  "datetime",
  "datetimeoffset",
];
