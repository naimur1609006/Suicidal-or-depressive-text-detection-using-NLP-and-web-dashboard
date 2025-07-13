import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Schema, model } from 'mongoose';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { AuthModel, ILoginUser, roles } from './auth.interface';

const authSchema = new Schema<ILoginUser, AuthModel>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },

    role: {
      type: String,
      required: true,
      enum: roles,
    },
    dob: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    postalZip: {
      type: String,
      required: false,
    },
    region: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },

    friends: {
      type: [Schema.Types.ObjectId],
      ref: 'Authentications',
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

// is user exist
authSchema.statics.isUserExist = async function (
  email: string
): Promise<Pick<ILoginUser, 'email' | 'password' | 'role'> | null> {
  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  return await Authentications.findOne(
    { email: normalizedEmail },
    { email: 1, password: 1, role: 1 }
  );
};

// Add normalize email static method
authSchema.statics.normalizeEmail = function (email: string): string {
  return email ? email.toLowerCase().trim() : '';
};

// is password match
authSchema.statics.isPasswordMatch = async function (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

// pre save hook
authSchema.pre('save', async function (next) {
  // convert email to lowercase and trim
  this.email = this.email ? this.email.toLowerCase().trim() : '';

  // hash password
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  // check email exist
  const isExist = await Authentications.findOne({ email: this.email });
  if (isExist) throw new ApiError(httpStatus.CONFLICT, 'User already exist');
  next();
});

export const Authentications = model<ILoginUser, AuthModel>(
  'Authentications',
  authSchema
);
