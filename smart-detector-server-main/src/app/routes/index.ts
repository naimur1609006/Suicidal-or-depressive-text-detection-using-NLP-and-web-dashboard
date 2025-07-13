import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { PostsRoutes } from '../modules/Posts/Posts.route';

const routes = express.Router();

const moduleRotes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/posts',
    route: PostsRoutes,
  },
];

moduleRotes.forEach(route => {
  routes.use(route.path, route.route);
});

export default routes;
