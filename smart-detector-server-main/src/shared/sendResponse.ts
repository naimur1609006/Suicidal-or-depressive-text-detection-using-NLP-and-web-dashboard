import { Response } from 'express';
import httpStatus from 'http-status';
type IApiResponse<T> = {
  message?: string | null;
  success: boolean;
  statusCode: number;
  data?: T | null;
  meta?: {
    page: number;
    limit: number;
    found: number;
    total: number;
  };
  [key: string]: unknown;
};

const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  const responseData: IApiResponse<T> = {
    ...data,
    statusCode: data.statusCode,
    success: data.success,
    message: data.message || null,
    meta: data.meta || null || undefined,
    data: data.data || null,
  };
  if (!data.data && data.statusCode === httpStatus.OK) {
    responseData.success = false;
    responseData.statusCode = httpStatus.NO_CONTENT;
    responseData.message = 'No Content Found';
  }
  res.status(data.statusCode).json(responseData);
};
export default sendResponse;
