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
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <section className="surface-panel relative overflow-hidden p-6 sm:p-9">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-accent-soft/80 via-[#f4e9d7] to-[#e4e8dc]" />
        <div className="relative pt-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            {avatarOf(user) ? <img src={avatarOf(user)} alt="" className="h-24 w-24 rounded-full border-4 border-surface object-cover shadow-md" /> : <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-surface bg-accent text-3xl font-bold text-surface shadow-md">{(user.fullName || user.username || "Q").slice(0,1).toUpperCase()}</div>}
            <div>
              <h1 className="mt-3 font-heading text-4xl font-semibold">
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
        <p className="mt-7 max-w-2xl leading-7 text-muted">
          {/* SECURITY NOTE: user bio is user-generated content rendered as escaped JSX text.
              NEVER use dangerouslySetInnerHTML for user bios. */}
          {user.bio || "No bio yet."}
        </p>
        <div className="mt-6 flex gap-2 text-sm font-semibold">
          <button onClick={() => void openModal("followers")} className="rounded-full bg-accent-soft px-4 py-2 text-accent">{user.followersCount ?? 0} followers</button>
          <button onClick={() => void openModal("following")} className="rounded-full bg-[#e4e8dc] px-4 py-2 text-[#66705d]">{user.followingCount ?? 0} following</button>
        </div>
        </div>
      </section>
      <div className="mb-5 mt-10 flex items-center justify-between"><h2 className="font-heading text-3xl font-semibold">Published notes</h2><span className="text-sm text-muted">{posts.length} total</span></div>
      <section className="grid gap-4">
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
