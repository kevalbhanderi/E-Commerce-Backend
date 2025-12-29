export interface UserObject {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: 'user' | 'admin' | 'manager';
}
