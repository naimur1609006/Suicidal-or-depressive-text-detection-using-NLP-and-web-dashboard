import { SortOrder } from 'mongoose';

export type IPagination = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: SortOrder;
};

type IOptionResponse = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: SortOrder;
};

const calculatePagination = (options: IPagination): IOptionResponse => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 0;
  const skip = limit ? (page - 1) * limit : 0;
  const sortBy = options.sortBy || '';
  const sortOrder = options.sortOrder || 'asc';
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

export const paginationHelpers = {
  calculatePagination,
};
