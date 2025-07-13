import express from 'express';
import { ENUM_USER_ROLES } from '../../../enums/user';
import { createUploadMiddleware } from '../../../shared/createMulterStorage';
import auth from '../../middlewares/auth';
import originCheck from '../../middlewares/originCheck';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = express.Router();

const upload = createUploadMiddleware('users');

router.post(
  '/login',
  originCheck,
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.loginUser
);

router.get(
  '/find-user/:email',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  AuthController.findUser
);

router.get(
  '/:id',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  AuthController.findUserById
);

router.get(
  '/',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  AuthController.getAllUsers
);

router.post(
  '/signup',
  upload.single('image'),
  originCheck,
  validateRequest(AuthValidation.signupZodSchema),
  AuthController.signUpUser
);

router.post(
  '/refresh-token',
  originCheck,
  validateRequest(AuthValidation.refreshTokenZodSchema),
  AuthController.refreshToken
);

router.post('/reset-password', AuthController.ResetPassRequest);

router.post(
  '/reset-email',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  AuthController.chnageEmail
);

router.post(
  '/change-password',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  validateRequest(AuthValidation.changePasswordZodSchema),

  AuthController.ChangePassword
);

router.patch(
  '/change-role',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  AuthController.ChangeRole
);

router.delete(
  '/:id',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  AuthController.DeleteUser
);

router.patch(
  '/:id',
  upload.single('image'),
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  AuthController.UpdateUser
);

// Search users route
router.get(
  '/search/users',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  AuthController.searchUsers
);

// Friend routes
router.post(
  '/add-friend/profile',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  validateRequest(AuthValidation.friendOperationZodSchema),
  AuthController.addFriend
);

router.post(
  '/remove-friend/profile',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  validateRequest(AuthValidation.friendOperationZodSchema),
  AuthController.removeFriend
);

router.get(
  '/friends/:id',
  originCheck,
  auth(
    ENUM_USER_ROLES.DEVELOPER,
    ENUM_USER_ROLES.SUPER_ADMIN,
    ENUM_USER_ROLES.USER
  ),
  AuthController.getFriendsList
);

export const AuthRoutes = router;
