import { Schema, model } from 'mongoose';
import { iPosts, iPostsModel } from './Posts.interface';

const PostsSchema = new Schema<iPosts, iPostsModel>(
  {
    title: {
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: false,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Authentications',
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Authentications',
      },
    ],
    comments: [
      {
        text: {
          type: String,
          required: false,
        },
        user: {
          type: Schema.Types.ObjectId,
          ref: 'Authentications',
          required: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    image: {
      type: String,
      required: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        required: false,
      },
    ],
    isSucidal: {
      type: Boolean,
      default: false,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Posts = model<iPosts, iPostsModel>('Posts', PostsSchema);

export default Posts;
