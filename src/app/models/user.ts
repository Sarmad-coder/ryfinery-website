import { BaseModel } from '@shared/BaseModel';

export interface User extends BaseModel {
  username: string;
  email: string;
  password: string;
  fullname: string;
  confirmed: boolean;
  blocked: boolean;
  isDeleted: boolean;
  deletedAt: Date;
  role: any; // Relation with Role (from: users-permissions)
  image: any;
  provider: string;
  resetPasswordToken: string;
  confirmationToken: string;
}
