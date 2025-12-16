import { MENU } from "@app/modules/main/menu-sidebar/MenuSidebar";

export const flattenMenu = (items = MENU) => {
  const flattened: { name: string; path: string }[] = [];

  const walk = (list: any[]) => {
    list.forEach((item) => {
      if (item.path) flattened.push({ name: item.name, path: item.path });
      if (item.children) walk(item.children);
    });
  };

  walk(items);
  return flattened;
};
