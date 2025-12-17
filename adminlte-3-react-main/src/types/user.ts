export interface IUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  token?: string;
  photoURL?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  metadata?: any;
}

export interface IRole {
  _id: string;
  name: string;
  displayName?: string;
  permissions?: string[];
  sidebarAccess?: string[];
}

export interface IUserRow {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role?: string | IRole;
  createdAt?: string;
}
