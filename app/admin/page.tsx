"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { getId, listFrom, postTitle } from "@/lib/normalizers";
import type { ActivityLog, Post, User } from "@/lib/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Shell } from "@/components/Shell";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [auditLogs, setAuditLogs] = useState<ActivityLog[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [postSearch, setPostSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");

  async function load() {
    const [usersResponse, postsResponse, auditResponse] = await Promise.all([
      api.get("/admin/users"),
      api.get("/admin/posts"),
      api.get("/admin/audit-logs"),
    ]);
    setUsers(listFrom<User>(usersResponse.data, ["users", "data"]));
    setPosts(listFrom<Post>(postsResponse.data, ["posts", "data"]));
    setAuditLogs(listFrom<ActivityLog>(auditResponse.data, ["logs", "data"]));
  }

  useEffect(() => {
    void load().catch(() => undefined);
  }, []);

  const filteredUsers = useMemo(() => {
    const needle = userSearch.toLowerCase();
    return users.filter((user) => `${user.fullName} ${user.username} ${user.email || ""}`.toLowerCase().includes(needle));
  }, [userSearch, users]);

  const filteredPosts = useMemo(() => {
    const needle = postSearch.toLowerCase();
    return posts.filter((post) => postTitle(post).toLowerCase().includes(needle));
  }, [postSearch, posts]);

  const filteredAuditLogs = useMemo(() => {
    const needle = auditSearch.toLowerCase();
    return auditLogs.filter((log) => `${log.action} ${log.ip || ""} ${log.userAgent || ""}`.toLowerCase().includes(needle));
  }, [auditLogs, auditSearch]);

  async function deleteUser(user: User) {
    await api.delete(`/admin/users/delete/${getId(user)}`);
    await load();
  }

  async function deletePost(post: Post) {
    await api.delete(`/admin/posts/delete/${post._id || post.id}`);
    await load();
  }

  function exportAuditLogs() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/admin/audit-logs/export`;
  }

  return (
    <ProtectedRoute adminOnly>
      <Shell>
        <main className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="font-heading text-4xl">Admin panel</h1>
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-heading text-2xl">Users</h2>
                <input className="field max-w-xs" placeholder="Search users" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} />
              </div>
              <div className="grid gap-3">
                {filteredUsers.map((user) => (
                  <article key={getId(user)} className="rounded-quill border border-line bg-surface p-4">
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-muted">@{user.username} {user.email}</p>
                    <div className="mt-3 flex gap-2">
                      <a className="btn btn-secondary py-2 text-sm" href={`/profile/${user.username}`}>View</a>
                      <button className="btn btn-danger py-2 text-sm" onClick={() => void deleteUser(user)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-heading text-2xl">Posts</h2>
                <input className="field max-w-xs" placeholder="Search posts" value={postSearch} onChange={(event) => setPostSearch(event.target.value)} />
              </div>
              <div className="grid gap-3">
                {filteredPosts.map((post) => (
                  <article key={post._id || post.id} className="rounded-quill border border-line bg-surface p-4">
                    <p className="font-medium">{postTitle(post)}</p>
                    <p className="text-sm text-muted">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</p>
                    <div className="mt-3 flex gap-2">
                      <a className="btn btn-secondary py-2 text-sm" href={`/post/${post._id || post.id}`}>View</a>
                      <button className="btn btn-danger py-2 text-sm" onClick={() => void deletePost(post)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
          <section className="mt-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-2xl">Audit logs</h2>
              <div className="flex flex-wrap gap-2">
                <input className="field max-w-xs" placeholder="Search audit logs" value={auditSearch} onChange={(event) => setAuditSearch(event.target.value)} />
                <button className="btn btn-secondary" onClick={exportAuditLogs}>Export</button>
              </div>
            </div>
            <div className="grid gap-3">
              {filteredAuditLogs.map((log) => (
                <article key={log._id} className="rounded-quill border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-muted">{log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">{log.ip || "No IP recorded"}</p>
                  {log.userAgent ? <p className="mt-1 break-all text-xs text-muted">{log.userAgent}</p> : null}
                </article>
              ))}
            </div>
          </section>
        </main>
      </Shell>
    </ProtectedRoute>
  );
}
