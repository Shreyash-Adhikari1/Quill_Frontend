"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import type { Post, User } from "@/lib/types";
import { avatarOf, getId, listFrom } from "@/lib/normalizers";
import { PostCard } from "./PostCard";
import { FollowersModal } from "./FollowersModal";

export function ProfileView({ user, own = false }: { user: User; own?: boolean }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [modal, setModal] = useState<"followers" | "following" | null>(null);
  const [modalUsers, setModalUsers] = useState<User[]>([]);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const id = getId(user);
    const endpoint = own ? "/post/posts/my-posts" : `/post/posts/user/${id}`;
    void api.get(endpoint).then((res) => setPosts(listFrom<Post>(res.data, ["posts", "data"]))).catch(() => setPosts([]));
    if (!own && id) {
      void api.get(`/follow/is-following/${id}`).then((res) => setFollowing(Boolean(res.data?.isFollowing))).catch(() => undefined);
    }
  }, [own, user]);

  async function openModal(kind: "followers" | "following") {
    const id = getId(user);
    const endpoint = own ? `/follow/${kind}` : `/follow/${id}/${kind}`;
    const response = await api.get(endpoint);
    setModalUsers(listFrom<User>(response.data, [kind, "users", "data"]));
    setModal(kind);
  }

  async function toggleFollow() {
    const id = getId(user);
    await api.post(`/follow/${following ? "unfollow" : "follow"}/${id}`);
    setFollowing((value) => !value);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <section className="border-b border-line pb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            {avatarOf(user) ? <img src={avatarOf(user)} alt="" className="h-20 w-20 rounded-quill object-cover" /> : <div className="h-20 w-20 rounded-quill bg-accent-soft" />}
            <div>
              <h1 className="font-heading text-4xl">
                {/* SECURITY NOTE: fullName is user-generated content rendered as escaped JSX text. */}
                {user.fullName}
              </h1>
              <p className="mt-1 text-muted">
                {/* SECURITY NOTE: username is user-generated content rendered as escaped JSX text. */}
                @{user.username}
              </p>
            </div>
          </div>
          {own ? <Link className="btn btn-secondary" href="/profile/edit">Edit profile</Link> : <button className="btn btn-primary" onClick={toggleFollow}>{following ? "Unfollow" : "Follow"}</button>}
        </div>
        <p className="mt-6 max-w-2xl leading-7 text-muted">
          {/* SECURITY NOTE: user bio is user-generated content rendered as escaped JSX text.
              NEVER use dangerouslySetInnerHTML for user bios. */}
          {user.bio || "No bio yet."}
        </p>
        <div className="mt-5 flex gap-5 text-sm">
          <button onClick={() => void openModal("followers")} className="text-accent">{user.followersCount ?? 0} followers</button>
          <button onClick={() => void openModal("following")} className="text-accent">{user.followingCount ?? 0} following</button>
        </div>
      </section>
      <section className="py-6">
        {posts.map((post) => (
          <PostCard
            key={post._id || post.id}
            post={post}
            showActions={own}
            onDeleted={(postId) => setPosts((items) => items.filter((item) => (item._id || item.id) !== postId))}
          />
        ))}
        {posts.length === 0 ? <p className="py-8 text-muted">No notes published yet.</p> : null}
      </section>
      {modal ? <FollowersModal title={modal === "followers" ? "Followers" : "Following"} users={modalUsers} onClose={() => setModal(null)} /> : null}
    </main>
  );
}
