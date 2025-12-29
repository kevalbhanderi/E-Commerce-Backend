import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ISessionToken } from '../interface/session-token.interface';

export type SessionTokenDocument = ISessionToken & Document;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'session_tokens',
})
export class SessionToken {
  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ type: String, ref: 'User' })
  user_id?: string;

  @Prop({ type: String, ref: 'Admin' })
  admin_id?: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, enum: ['user', 'admin'], index: true })
  role: 'user' | 'admin';

  @Prop()
  ip_address?: string;

  @Prop()
  user_agent?: string;

  @Prop({ required: true, index: true })
  expires_at: Date;

  @Prop({ default: true })
  is_active: boolean;
}

export const SessionTokenSchema = SchemaFactory.createForClass(SessionToken);

// Indexes
SessionTokenSchema.index({ token: 1 });
SessionTokenSchema.index({ email: 1, role: 1 });
SessionTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion
SessionTokenSchema.index({ user_id: 1 });
SessionTokenSchema.index({ admin_id: 1 });
SessionTokenSchema.index({ is_active: 1 });
