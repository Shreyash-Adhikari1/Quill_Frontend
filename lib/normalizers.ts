import type { Comment, Post, User } from "./types";

export function getId(entity?: { _id?: string; id?: string } | string | null) {
  if (!entity) return "";
  return typeof entity === "string" ? entity : entity._id || entity.id || "";
}

export function avatarOf(user?: User | null) {
  const avatar = user?.avatarUrl || user?.avatar || "";
  if (!avatar) return "";
  if (/^https?:\/\//i.test(avatar) || avatar.startsWith("/")) return avatar;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const serverBase = apiBase.replace(/\/api\/?$/, "");
  // Backend stores multer avatar filenames only; frontend expands them to the static uploads path.
  return `${serverBase}/uploads/profile-image/${avatar}`;
}

export function postTitle(post: Post) {
  return post.postTitle || post.title || post.caption || "Untitled note";
}

export function postContent(post: Post) {
  return post.postContent || post.content || post.caption || "";
}

export function postAuthor(post: Post) {
  if (post.author) return post.author;
  return typeof post.userId === "object" ? post.userId : undefined;
}

export function commentContent(comment: Comment) {
  return comment.content || comment.commentText || "";
}

export function commentAuthor(comment: Comment) {
  if (comment.author) return comment.author;
  return typeof comment.userId === "object" ? comment.userId : undefined;
}

export function listFrom<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as T[];
  }
  return [];
}
