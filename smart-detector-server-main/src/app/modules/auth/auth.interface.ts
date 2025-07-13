import { Model } from 'mongoose';

export type Roles = 'super_admin' | 'developer' | 'user';

export const roles: Roles[] = ['super_admin', 'developer', 'user'];

export type ILoginUser = {
  name: string;
  email: string;
  password: string;
  dob?: string;
  phone?: string;
  address?: string;
  postalZip: string;
  region?: string;
  country?: string;
  image?: string;
  role: Roles;
  friends?: string[];
};

export type AuthModel = {
  isUserExist(
    email: string
  ): Promise<Pick<ILoginUser, 'email' | 'password' | 'role'>>;
  isPasswordMatch(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>;
  normalizeEmail(email: string): string;
} & Model<ILoginUser>;

export const normalizeEmail = (email: string): string => {
  return email ? email.toLowerCase().trim() : '';
};
