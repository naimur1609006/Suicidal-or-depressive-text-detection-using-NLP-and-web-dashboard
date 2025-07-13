import { Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import {
  filterableFieldsAllUsers,
  paginationFields,
} from '../../constants/constants';
import { AuthService } from './auth.service';

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginUser(loginData);
  const { refreshToken, ...others } = result;

  // set cookies
  const cookieOptions = {
    secure: config.node_type === 'production' ? true : false,
    httpOnly: true,
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse(res, {
    message: 'User logged in successfully',
    success: true,
    data: others,
    statusCode: httpStatus.OK,
  });
});

const getAllUsers: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, filterableFieldsAllUsers);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await AuthService.getAllUsers(filters, paginationOptions);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  }
);

const findUser = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.params;
  const result = await AuthService.findUser(email);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Users found successfully',
    data: result,
  });
});

const findUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AuthService.findUserById(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Users found successfully',
    data: result,
  });
});

export const signUpUser = catchAsync(async (req: Request, res: Response) => {
  const image = req.file ? req.file.path : undefined;
  const result = await AuthService.signUpUser({
    ...req.body,
    image: image,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User created successfully',
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshToken(refreshToken);

  // set cookies
  const cookieOptions = {
    secure: config.node_type === 'production' ? true : false,
    httpOnly: true,
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse(res, {
    message: 'User logged in successfully',
    success: true,
    data: result,
    statusCode: httpStatus.OK,
  });
});

const chnageEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, newEmail } = req.body;
  const result = await AuthService.chnageEmail(email, newEmail);
  sendResponse(res, {
    message: 'Email changed successfully',
    success: true,
    data: result,
    statusCode: httpStatus.OK,
  });
});

const ResetPassRequest = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.ResetPassRequest(email);
  sendResponse(res, {
    message: 'Please check your email to reset password.',
    success: true,
    data: result,
    statusCode: httpStatus.OK,
  });
});

const ChangePassword = catchAsync(async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  const result = await AuthService.ChangePassword(email, newPassword);
  sendResponse(res, {
    message: 'Password changed successfully',
    success: true,
    data: result,
    statusCode: httpStatus.OK,
  });
});

const ChangeRole = catchAsync(async (req: Request, res: Response) => {
  const { email, role } = req.body;
  const result = await AuthService.ChangeRole(email, role);
  sendResponse(res, {
    message: 'Role changed successfully',
    success: true,
    data: result,
    statusCode: httpStatus.OK,
  });
});

const DeleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.DeleteUser(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User deleted successfully',
    data: result,
  });
});

const UpdateUser = catchAsync(async (req: Request, res: Response) => {
  const image = req.file ? req.file.path : undefined;
  const result = await AuthService.UpdateUser(req.params.id, req.body, image);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User updated successfully',
    data: result,
  });
});

const addFriend = catchAsync(async (req: Request, res: Response) => {
  const { userId, friendId } = req.body;
  const result = await AuthService.addFriend(userId, friendId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Friend added successfully',
    data: result,
  });
});

const removeFriend = catchAsync(async (req: Request, res: Response) => {
  const { userId, friendId } = req.body;
  const result = await AuthService.removeFriend(userId, friendId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Friend removed successfully',
    data: result,
  });
});

const getFriendsList = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AuthService.getFriendsList(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Friends list retrieved successfully',
    data: result,
  });
});

const searchUsers = catchAsync(async (req: Request, res: Response) => {
  const { query, limit, excludeUserId } = req.query;
  const limitValue = limit ? parseInt(limit as string) : 10;
  
  const result = await AuthService.searchUsers(
    query as string, 
    limitValue,
    excludeUserId as string
  );
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Users retrieved successfully',
    data: result,
  });
});

export const AuthController = {
  loginUser,
  refreshToken,
  signUpUser,
  findUser,
  getAllUsers,
  ResetPassRequest,
  ChangePassword,
  ChangeRole,
  DeleteUser,
  UpdateUser,
  chnageEmail,
  findUserById,
  addFriend,
  removeFriend,
  getFriendsList,
  searchUsers,
};
