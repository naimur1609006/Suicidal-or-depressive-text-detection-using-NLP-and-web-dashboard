import axios from 'axios';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import {
  IPaginationOptions,
  IfiltersPosts,
} from '../../../interfaces/pagination';
import { deleteFile } from '../../../shared/createMulterStorage';
import sendEmail from '../../../shared/sendEmail';
import { filterableFieldsPosts } from '../../constants/constants';
import {
  generateSuicidalCommentEmailTemplate,
  generateSuicidalPostEmailTemplate,
} from '../../shared/emailTemplates';
import { AuthService } from '../auth/auth.service';
import { iPosts } from './Posts.interface';
import Posts from './Posts.model';

// Function to notify friends about a suicidal post
const notifyFriendsAboutSuicidalPost = async (
  userId: string,
  postTitle: string,
  postContent: string,
  postId: string,
  postImage?: string
) => {
  try {
    // Get the user's friends
    const { friends } = await AuthService.getFriendsList(userId);

    if (!friends || friends.length === 0) {
      return;
    }

    // Get the user who made the post
    const user = await AuthService.findUserById(userId);

    // For each friend, send an email notification
    for (const friend of friends) {
      if (friend.email) {
        // Extract image filename for proper CID reference
        const imageFilename = postImage
          ? postImage.split('\\').pop() ||
            postImage.split('/').pop() ||
            'post-image'
          : '';

        const emailHtml = generateSuicidalPostEmailTemplate({
          friendName: user.name,
          postTitle: postTitle,
          postContent: postContent,
          postId: postId,
          userName: friend.name,
          postImage: postImage,
        });

        // Prepare attachments array for the image if available
        const attachments = postImage
          ? [
              {
                filename: imageFilename,
                path: postImage,
              },
            ]
          : [];

        await sendEmail(
          friend.email,
          'Concerning post from your friend',
          emailHtml,
          attachments
        );
      }
    }
  } catch (error) {
    console.error('Failed to notify friends about suicidal post:', error);
  }
};

// Function to notify friends about a suicidal comment
const notifyFriendsAboutSuicidalComment = async (
  userId: string,
  commentContent: string,
  postId: string,
  postImage?: string
) => {
  try {
    // Get the user's friends
    const { friends } = await AuthService.getFriendsList(userId);

    if (!friends || friends.length === 0) {
      return;
    }

    // Get the user who made the comment
    const user = await AuthService.findUserById(userId);

    // For each friend, send an email notification
    for (const friend of friends) {
      if (friend.email) {
        // Extract image filename for proper CID reference
        const imageFilename = postImage
          ? postImage.split('\\').pop() ||
            postImage.split('/').pop() ||
            'post-image'
          : '';

        const emailHtml = generateSuicidalCommentEmailTemplate({
          friendName: user.name,
          commentContent: commentContent,
          postId: postId,
          userName: friend.name,
          postImage: postImage,
        });

        // Prepare attachments array for the image if available
        const attachments = postImage
          ? [
              {
                filename: imageFilename,
                path: postImage,
              },
            ]
          : [];

        await sendEmail(
          friend.email,
          'Concerning comment from your friend',
          emailHtml,
          attachments
        );
      }
    }
  } catch (error) {
    console.error('Failed to notify friends about suicidal comment:', error);
  }
};

const createPosts = async (data: iPosts): Promise<iPosts> => {
  if (data.content || data.title) {
    const textsToCheck = [];
    if (data.title) textsToCheck.push(data.title);
    if (data.content) textsToCheck.push(data.content);
    const response = await axios.post('http://localhost:8000/predict', {
      texts: textsToCheck,
    });

    const predictions = response.data.predictions;

    if (predictions && predictions.length > 0) {
      data.isSucidal = predictions.includes(1);
      if (data.isSucidal) {
        data.detectedAt = new Date();
        data.score = 1;
      }
    }
  }

  const result = await Posts.create(data);

  // If the post is suicidal, notify the user's friends
  if (result.isSucidal && result.postedBy) {
    await notifyFriendsAboutSuicidalPost(
      result.postedBy.toString(),
      result.title,
      result.content,
      result._id.toString(),
      result.image
    );
  }

  return result;
};

const getPosts = async (
  filters: IfiltersPosts,
  paginationOptions: IPaginationOptions
) => {
  const { search, ...filtersData } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions as any);

  const filterConditions = [];

  if (search) {
    filterConditions.push({
      $or: filterableFieldsPosts
        .filter(field => field !== 'postedBy')
        .map(field => ({
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
  const result = await Posts.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    .populate('postedBy');

  const total = await Posts.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
      found: result.length,
    },
    data: result,
  };
};

const getMyPosts = async (
  userId: string,
  filters: IfiltersPosts,
  paginationOptions: IPaginationOptions
) => {
  const { search, ...filtersData } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions as any);

  const filterConditions = [];

  // Add condition to filter by user ID
  filterConditions.push({ postedBy: userId });

  if (search) {
    filterConditions.push({
      $or: filterableFieldsPosts
        .filter(field => field !== 'postedBy')
        .map(field => ({
          [field]: { $regex: search, $options: 'i' },
        })),
    });
  }

  if (Object.keys(filtersData).length) {
    filterConditions.push(filtersData);
  }

  const sortConditions =
    sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: -1 };

  const whereConditions =
    filterConditions.length > 0 ? { $and: filterConditions } : {};

  const result = await Posts.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    .populate('postedBy');

  const total = await Posts.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
      found: result.length,
    },
    data: result,
  };
};

const getSinglePosts = async (id: string): Promise<iPosts | null> => {
  const result = await Posts.findById(id).populate('postedBy');
  return result;
};

const updatePosts = async (
  id: string,
  data: Partial<iPosts>
): Promise<iPosts | null> => {
  const findPosts = await Posts.findById(id);

  if (data.image && findPosts?.image) {
    await deleteFile(findPosts.image);
  }

  const result = await Posts.findByIdAndUpdate(id, data, {
    runValidators: true,
    new: true,
  });

  return result;
};

const deletePosts = async (id: string): Promise<iPosts | null> => {
  const findPosts = await Posts.findById(id);
  if (findPosts?.image) {
    await deleteFile(findPosts.image);
  }

  const task = await Posts.findByIdAndDelete(id);
  return task;
};

const likePost = async (
  postId: string,
  userId: string
): Promise<iPosts | null> => {
  const post = await Posts.findById(postId);

  if (!post) {
    throw new Error('Post not found');
  }

  const isLiked = post.likes?.some(like => like.toString() === userId);

  let result;
  if (isLiked) {
    // Unlike post
    result = await Posts.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: userId },
      },
      { new: true }
    ).populate('postedBy');
  } else {
    // Like post
    result = await Posts.findByIdAndUpdate(
      postId,
      {
        $addToSet: { likes: userId },
      },
      { new: true }
    ).populate('postedBy');
  }

  return result;
};

const addComment = async (
  postId: string,
  comment: { text: string; user: string; createdAt: Date }
): Promise<iPosts | null> => {
  const post = await Posts.findById(postId);

  if (!post) {
    throw new Error('Post not found');
  }

  // Check if the comment text is suicidal
  if (comment.text) {
    try {
      const response = await axios.post('http://localhost:8000/predict', {
        texts: [comment.text],
      });

      const predictions = response.data.predictions;
      const isCommentSuicidal =
        predictions && predictions.length > 0 && predictions.includes(1);

      if (isCommentSuicidal) {
        // Notify friends about the suicidal comment using the comment-specific function
        await notifyFriendsAboutSuicidalComment(
          comment.user,
          comment.text,
          postId,
          post.image
        );
      }
    } catch (error) {
      console.error('Failed to check if comment is suicidal:', error);
    }
  }

  const result = await Posts.findByIdAndUpdate(
    postId,
    {
      $push: { comments: comment },
    },
    { new: true }
  ).populate('postedBy');

  return result;
};

export const PostsService = {
  createPosts,
  getPosts,
  updatePosts,
  deletePosts,
  getSinglePosts,
  likePost,
  addComment,
  getMyPosts,
};
