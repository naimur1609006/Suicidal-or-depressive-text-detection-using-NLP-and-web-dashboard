import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  frontend_url: process.env.FRONTEND_URL,
  backend_url: process.env.BACKEND_URL,
  port: process.env.PORT,
  host: process.env.HOST,
  database_url: process.env.DATABASE_URL,
  database_name: process.env.DATABASE_NAME,
  node_type: process.env.NODE_ENV,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  email_host: process.env.EMAIL_HOST,
  email_userName: process.env.EMAIL_NAME,
  email_user: process.env.EMAIL_USER,
  email_password: process.env.EMAIL_PASS,
  contact_email: process.env.CONTACT_EMAIL,
  jwt: {
    secret: process.env.JWT_SECRET,
    secret_expires_in: process.env.JWT_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_secret_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
};
