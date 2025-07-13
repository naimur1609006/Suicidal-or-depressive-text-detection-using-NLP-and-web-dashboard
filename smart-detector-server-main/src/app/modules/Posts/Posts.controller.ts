import { Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import {
  filterableFieldsPosts,
  paginationFields,
} from '../../constants/constants';
import { iPosts } from './Posts.interface';
import { PostsService } from './Posts.service';

const createPosts: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const image = req.file ? req.file.path : undefined;

    const result = await PostsService.createPosts({
      ...req.body,
      image,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Posts created successfully',
      data: result,
    });
  }
);

const getPosts: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, filterableFieldsPosts);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await PostsService.getPosts(filters, paginationOptions);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Posts retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  }
);

const getSinglePosts: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PostsService.getSinglePosts(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Posts retrieved successfully',
      data: result,
    });
  }
);

const updatePosts: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { _id, ...others } = req.body;

    const updateData: Partial<iPosts> = {};

    Object.keys(others).forEach(key => {
      if (others[key] !== undefined && others[key] !== null) {
        updateData[key as keyof iPosts] = others[key];
      }
    });

    if (req.file) {
      updateData.image = req.file.path;
    }

    const result = await PostsService.updatePosts(_id, updateData);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Posts updated successfully',
      data: result,
    });
  }
);

const deletePosts: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PostsService.deletePosts(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Posts deleted successfully',
      data: result,
    });
  }
);

const likePost: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.body?.userId;

    const result = await PostsService.likePost(id, userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Post liked successfully',
      data: result,
    });
  }
);

const addComment: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.body?.user;

    const result = await PostsService.addComment(id, {
      text,
      user: userId,
      createdAt: new Date(),
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Comment added successfully',
      data: result,
    });
  }
);

const filterableFeildsActivities = [
  'searchTerm',
  'tags',
  'isPublic',
  'isSucidal',
  'detectedAt',
  'score',
];

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const { user } = req.query as { user: string };
  const filters = pick(req.query, filterableFeildsActivities);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await PostsService.getMyPosts(
    user,
    filters,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My posts retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

export const PostsController = {
  createPosts,
  getPosts,
  updatePosts,
  deletePosts,
  getSinglePosts,
  likePost,
  addComment,
  getMyPosts,
};
