import { z } from 'zod';

const addPostsSchema = z.object({
  body: z.object({}),
});

export const PostsValidation = {
  addPostsSchema,
};
