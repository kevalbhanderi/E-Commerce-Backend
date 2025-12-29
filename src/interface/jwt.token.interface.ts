export interface JwtTokenInterface {
  readonly user_id: string;
  readonly role: 'user' | 'admin';
  readonly ip_Address?: string;
}
