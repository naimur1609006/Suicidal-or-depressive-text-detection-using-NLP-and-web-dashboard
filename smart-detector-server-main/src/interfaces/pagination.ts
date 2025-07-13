export type IPaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type IfiltersAllUsers = {
  search?: string;
  phone?: string;
  name?: string;
  email?: string;
  dob?: string;
  address?: string;
  postalZip?: string;
  region?: string;
  country?: string;
  organization?: string;
};

export type IfiltersPosts = {
  search?: string;
  title?: string;
  content?: string;
  postedBy?: string;
  likes?: string;
  comments?: string;
  image?: string;
  isPublic?: boolean;
  tags?: string[];
};
