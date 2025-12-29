import { Document } from 'mongoose';

export interface ISessionToken extends Document {
  readonly token: string;
  readonly user_id?: string;
  readonly admin_id?: string;
  readonly email: string;
  readonly role: 'user' | 'admin' | 'manager';
  readonly ip_address?: string;
  readonly user_agent?: string;
  readonly expires_at: Date;
  readonly is_active: boolean;
  readonly createdAt: Date;
}
