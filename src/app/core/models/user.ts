import { Role } from './role';

export class User {
  id!: number;
  img!: string;
  name!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  role!: Role;
  token!: string;
}
