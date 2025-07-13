import { ZodError, ZodIssue } from 'zod';
import { IErrorResponse } from '../interfaces/common';
import { IErrorMessage } from '../interfaces/error';

const handleZodError = (err: ZodError): IErrorResponse => {
  const errors: IErrorMessage[] = err.issues.map((el: ZodIssue) => {
    return {
      path: el.path[el.path.length - 1],
      message: el.message,
    };
  });
  const statusCode = 400;
  return {
    statusCode,
    message: 'Validation error',
    errors: errors,
  };
};

export default handleZodError;
