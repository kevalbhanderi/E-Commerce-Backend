export interface JwtTokenInterface {
  readonly user_id: string;
  readonly role: 'user' | 'admin' | 'manager';
  readonly ip_Address?: string;
}
