export type User = {
  _id: string;
  id?: string;
  fullName: string;
  username: string;
  email?: string;
  role?: "user" | "admin" | string;
  bio?: string;
  avatarUrl?: string;
  avatar?: string;
  isVerified?: boolean;
  otpEnabled?: boolean;
  followersCount?: number;
  followingCount?: number;
};

export type Post = {
  _id: string;
  id?: string;
  postTitle?: string;
  postContent?: string;
  title?: string;
  content?: string;
  caption?: string;
  visibility?: "public" | "followers" | "private";
  isPrivate?: boolean;
  userId?: User | string;
  author?: User;
  createdAt?: string;
  likeCount?: number;
  likedBy?: Array<string | User>;
  commentCount?: number;
};

export type Comment = {
  _id: string;
  id?: string;
  commentText?: string;
  content?: string;
  userId?: User | string;
  author?: User;
  createdAt?: string;
};

export type ActivityLog = {
  _id: string;
  userId?: string | User;
  action: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
} & T;
