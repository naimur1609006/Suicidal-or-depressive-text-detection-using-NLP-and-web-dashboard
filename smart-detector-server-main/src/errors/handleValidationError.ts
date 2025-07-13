import mongoose from 'mongoose';
import { IErrorResponse } from '../interfaces/common';
import { IErrorMessage } from '../interfaces/error';

const handleValidationError = (
  err: mongoose.Error.ValidationError
): IErrorResponse => {
  const errors: IErrorMessage[] = Object.values(err.errors).map(
    (el: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: el?.path,
        message: el?.message,
      };
    }
  );
  const statusCode = 400;
  return {
    statusCode,
    message: 'Validation error',
    errors: errors,
  };
};

export default handleValidationError;
