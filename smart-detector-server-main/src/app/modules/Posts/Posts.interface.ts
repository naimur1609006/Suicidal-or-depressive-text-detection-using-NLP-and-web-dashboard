import { Model } from 'mongoose';
import { ILoginUser } from '../auth/auth.interface';

export type iPosts = {
  title: string;
  content: string;
  postedBy: ILoginUser;
  likes?: ILoginUser[];
  comments?: {
    text: string;
    user: ILoginUser;
    createdAt: Date;
  }[];
  image?: string;
  isPublic?: boolean;
  tags?: string[];
  isSucidal?: boolean;
  detectedAt?: Date;
  score?: number;
};

export type iPostsModel = Model<iPosts>;
