import { Document } from 'mongoose';

export interface IUser extends Document {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: 'user';
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
