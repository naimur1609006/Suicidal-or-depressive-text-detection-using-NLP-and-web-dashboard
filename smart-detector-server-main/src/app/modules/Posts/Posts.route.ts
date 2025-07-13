import express from 'express';
import { ENUM_USER_ROLES } from '../../../enums/user';
import { createUploadMiddleware } from '../../../shared/createMulterStorage';
import auth from '../../middlewares/auth';
import originCheck from '../../middlewares/originCheck';
import validateRequest from '../../middlewares/validateRequest';
import { PostsController } from './Posts.controller';
import { PostsValidation } from './Posts.validation';

const router = express.Router();

const upload = createUploadMiddleware('posts');

router.post(
  '/',
  originCheck,
  upload.single('image'),
  validateRequest(PostsValidation.addPostsSchema),
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  PostsController.createPosts
);
router.get(
  '/',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  PostsController.getPosts
);

router.get(
  '/my-posts/all',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  PostsController.getMyPosts
);

router.get(
  '/:id',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  PostsController.getSinglePosts
);

router.patch(
  '/:id',
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  originCheck,
  upload.single('image'),
  PostsController.updatePosts
);

router.delete(
  '/:id',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  PostsController.deletePosts
);

router.post(
  '/:id/like',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  PostsController.likePost
);

router.post(
  '/:id/comment',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  PostsController.addComment
);

export const PostsRoutes = router;
