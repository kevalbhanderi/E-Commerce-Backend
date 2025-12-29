import { Document } from 'mongoose';

export interface IAdmin extends Document {
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly role: 'admin';
  readonly permissions?: string[];
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

