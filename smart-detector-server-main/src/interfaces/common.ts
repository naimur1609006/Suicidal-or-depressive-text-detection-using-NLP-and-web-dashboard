import { IErrorMessage } from './error';

export type IErrorResponse = {
  statusCode: number;
  message: string;
  errors: IErrorMessage[];
};

export type IGenericResponse<T> = {
  meta: {
    page: number;
    limit: number;
    found: number;
    total: number;
  };
  data: T;
};

export type IChangePassword = {
  oldPassword: string;
  newPassword: string;
};
