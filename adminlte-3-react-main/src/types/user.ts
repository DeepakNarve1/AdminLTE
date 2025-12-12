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
