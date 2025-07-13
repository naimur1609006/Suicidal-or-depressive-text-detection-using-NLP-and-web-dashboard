import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import path from 'path';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import routes from './app/routes';
import config from './config';
import sendResponse from './shared/sendResponse';

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [config.frontend_url as string];

      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/', routes);

//handle global error
app.use(globalErrorHandler);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

//handle not found
app.use((req: Request, res: Response, next: NextFunction) => {
  sendResponse(res, {
    message: 'API Not Found',
    success: false,
    data: {
      url: req.originalUrl,
      method: req.method,
    },
    statusCode: httpStatus.NOT_FOUND,
  });
  next();
});

export default app;
