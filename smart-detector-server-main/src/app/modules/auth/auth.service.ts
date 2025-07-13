import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { JwtHelper } from '../../../helpers/jwt';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import {
  IfiltersAllUsers,
  IPaginationOptions,
} from '../../../interfaces/pagination';
import { deleteFile } from '../../../shared/createMulterStorage';
import { generatePasswordResetEmailTemplate } from '../../../shared/emailTemplates';
import sendEmail from '../../../shared/sendEmail';
import { filterableFieldsAllUsers } from '../../constants/constants';
import { ILoginUser } from './auth.interface';
import { Authentications } from './auth.model';

const loginUser = async (loginData: ILoginUser) => {
  const { email, password } = loginData;
  const isUserExist = await Authentications.isUserExist(email);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const isPasswordMatch =
    isUserExist.password &&
    (await Authentications.isPasswordMatch(password, isUserExist.password));

  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  const { email: userEmail, role } = isUserExist;
  const token = JwtHelper.createToken(
    {
      userEmail,
      role,
    },
    config.jwt.secret as Secret,
    config.jwt.secret_expires_in as string
  );

  const refreshToken = JwtHelper.createToken(
    {
      userEmail,
      role,
    },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_secret_expires_in as string
  );

  const getUser = await Authentications.findOne({ email });

  return {
    token,
    refreshToken,
    role: isUserExist.role,
    email: isUserExist.email,
    id: getUser?._id,
    varified: true,
    userName: getUser?.name,
    userProfile: getUser?.image,
    userNumber: getUser?.phone,
  };
};

const findUser = async (email: string) => {
  const isUserExist = await Authentications.findOne({ email });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return isUserExist;
};

const findUserById = async (id: string) => {
  const isUserExist = await Authentications.findById(id);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return isUserExist;
};

const signUpUser = async (data: ILoginUser) => {
  const isUserExist = await Authentications.findOne({
    email: data.email,
  });
  if (isUserExist) {
    throw new ApiError(httpStatus.CONFLICT, 'email already exist');
  }

  const result = await Authentications.create(data);
  return result;
};

const getAllUsers = async (
  filters: IfiltersAllUsers,
  paginationOptions: IPaginationOptions
) => {
  const { search, ...filtersData } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions as any);

  const filterConditions = [];

  if (search) {
    filterConditions.push({
      $or: filterableFieldsAllUsers.map(field => ({
        [field]: { $regex: search, $options: 'i' },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    filterConditions.push(filtersData);
  }

  const sortConditions = sortBy && sortOrder ? { [sortBy]: sortOrder } : {};

  const whereConditions =
    filterConditions.length > 0 ? { $and: filterConditions } : {};
  const result = await Authentications.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await Authentications.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    } as any,
    data: result,
  };
};

const refreshToken = async (refreshToken: string) => {
  let verifiedToken;
  try {
    verifiedToken = JwtHelper.verifyToken(
      refreshToken,
      config.jwt.refresh_secret as Secret
    );
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid refresh token');
  }
  const { userEmail } = verifiedToken;
  const isUserExist = await Authentications.isUserExist(userEmail as string);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const newToken = JwtHelper.createToken(
    {
      email: isUserExist.email,
      role: isUserExist.role,
    },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_secret_expires_in as string
  );
  return {
    token: newToken,
  };
};

const ResetPassRequest = async (email: string) => {
  const isUserExist = await Authentications.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const token = JwtHelper.createToken(
    {
      email: email,
      role: isUserExist.role,
    },
    config.jwt.secret as Secret,
    config.jwt.secret_expires_in as string
  );

  const emailHtml = generatePasswordResetEmailTemplate(
    `${config.frontend_url}/newPassword?email=${email}&token=${token}`
  );
  await sendEmail(email, 'Password Reset Request', emailHtml, []);

  return {
    message: 'Password reset successfully',
  };
};

const chnageEmail = async (email: string, newEmail: string) => {
  const isUserExist = await Authentications.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isNewEmailExist = await Authentications.findOne({ email: newEmail });
  if (isNewEmailExist) {
    throw new ApiError(httpStatus.CONFLICT, 'Email already exist');
  }

  const updatedUser = await Authentications.findOneAndUpdate(
    {
      email: email,
    },
    { email: newEmail },
    { new: true }
  );
  if (updatedUser) {
    return {
      message: 'Email changed successfully',
    };
  }
};

const ChangePassword = async (email: string, newPassword: string) => {
  const isUserExist = await Authentications.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const password = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await Authentications.findOneAndUpdate(
    { email: email },
    { password: password },
    { new: true }
  );

  /* reset the token */
  JwtHelper.createToken(
    {
      email: email,
      role: isUserExist.role,
    },
    config.jwt.secret as Secret,
    config.jwt.secret_expires_in as string
  );

  return {
    message: 'Password changed successfully',
  };
};

const ChangeRole = async (email: string, role: string) => {
  const isUserExist = await Authentications.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const updatedUser = await Authentications.findOneAndUpdate(
    {
      email: email,
    },
    { role: role },
    { new: true }
  );
  if (updatedUser) {
    return {
      message: 'Role changed successfully',
    };
  }
};

const DeleteUser = async (id: string) => {
  const user = await Authentications.findByIdAndDelete(id);
  if (user && user.image) {
    deleteFile(user.image);
  }
  return user;
};

const UpdateUser = async (
  id: string,
  data: Partial<ILoginUser>,
  image: string | null | undefined
): Promise<ILoginUser | null> => {
  const user = await Authentications.findById(id);

  if (!user) {
    throw new Error('User not found');
  }

  if (user && user.image && image) {
    await deleteFile(user.image);
  }

  const updatedImageUrl = image || user.image;

  const updatedData = {
    ...data,
    image: updatedImageUrl,
  };

  const result = await Authentications.findByIdAndUpdate(id, updatedData, {
    runValidators: true,
    new: true,
  });

  return result;
};

const addFriend = async (userId: string, friendId: string) => {
  // Check if both users exist
  const user = await Authentications.findById(userId);
  const friend = await Authentications.findById(friendId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!friend) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Friend not found');
  }

  // Check if already friends
  const isAlreadyFriend = user.friends?.includes(friendId);
  if (isAlreadyFriend) {
    throw new ApiError(httpStatus.CONFLICT, 'Already friends with this user');
  }

  // Add friend to user's friends list
  const updatedUser = await Authentications.findByIdAndUpdate(
    userId,
    { $push: { friends: friendId } },
    { new: true }
  ).populate('friends', 'name email image');

  return {
    message: 'Friend added successfully',
    user: updatedUser,
  };
};

const removeFriend = async (userId: string, friendId: string) => {
  // Check if both users exist
  const user = await Authentications.findById(userId);
  const friend = await Authentications.findById(friendId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!friend) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Friend not found');
  }

  // Check if they are friends
  const isFriend = user.friends?.includes(friendId);
  if (!isFriend) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User is not in your friends list');
  }

  // Remove friend from user's friends list
  const updatedUser = await Authentications.findByIdAndUpdate(
    userId,
    { $pull: { friends: friendId } },
    { new: true }
  ).populate('friends', 'name email image');

  return {
    message: 'Friend removed successfully',
    user: updatedUser,
  };
};

const getFriendsList = async (userId: string) => {
  const user = await Authentications.findById(userId).populate(
    'friends',
    'name email image'
  );

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return {
    friends: user.friends || [],
  };
};

const searchUsers = async (searchTerm: string, limit = 10, excludeUserId?: string) => {
  // Create a regex search pattern that's case insensitive
  const searchRegex = new RegExp(searchTerm, 'i');
  
  // Build the query
  const query: any = {
    $or: [
      { name: { $regex: searchRegex } },
      { email: { $regex: searchRegex } }
    ]
  };
  
  // Exclude the current user from results if provided
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }
  
  // Find users matching the search criteria
  const users = await Authentications.find(query)
    .select('name email image')
    .limit(limit);
    
  return users;
};

export const AuthService = {
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
