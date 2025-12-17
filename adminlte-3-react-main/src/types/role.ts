export interface IPermission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
}

// Define interface for new structure
export interface ISidebarAccess {
  path: string;
  create: boolean;
  edit: boolean;
  delete: boolean;
}