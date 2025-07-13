import { z } from 'zod';

const loginZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email(),
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});

const signupZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email(),
    password: z.string({
      required_error: 'Password is required',
    }),
    name: z.string({
      required_error: 'Name is required',
    }),
    phone: z.string().optional(),
    dob: z.string().optional(),
    address: z.string().optional(),
    postalZip: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
    role: z.string({
      required_error: 'role is required',
    }),
    image: z.string().optional(),
  }),
});
const changePasswordZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email(),
    newPassword: z.string({
      required_error: 'New Password is required',
    }),
  }),
});

const refreshTokenZodSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh Token id required',
    }),
  }),
});

const friendOperationZodSchema = z.object({
  body: z.object({
    userId: z.string({
      required_error: 'User ID is required',
    }),
    friendId: z.string({
      required_error: 'Friend ID is required',
    }),
  }),
});

export const AuthValidation = {
  loginZodSchema,
  refreshTokenZodSchema,
  changePasswordZodSchema,
  signupZodSchema,
  friendOperationZodSchema,
};
