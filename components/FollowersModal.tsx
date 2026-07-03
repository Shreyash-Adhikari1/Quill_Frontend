"use client";

import type { User } from "@/lib/types";
import { avatarOf } from "@/lib/normalizers";

export function FollowersModal({
  title,
  users,
  onClose,
}: {
  title: string;
  users: User[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/25 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-quill border border-line bg-surface p-5">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="font-heading text-xl">{title}</h2>
          <button className="text-muted" onClick={onClose}>Close</button>
        </div>
        <div className="mt-4 grid gap-3">
          {users.length === 0 ? <p className="text-muted">No writers here yet.</p> : null}
          {users.map((user) => (
            <div key={user._id || user.id} className="flex items-center gap-3">
              {avatarOf(user) ? <img src={avatarOf(user)} alt="" className="h-9 w-9 rounded-quill object-cover" /> : <div className="h-9 w-9 rounded-quill bg-accent-soft" />}
              <div>
                <p className="font-medium">
                  {/* SECURITY NOTE: fullName is user-generated content rendered through JSX escaping. */}
                  {user.fullName}
                </p>
                <p className="text-sm text-muted">
                  {/* SECURITY NOTE: username is user-generated content rendered through JSX escaping. */}
                  @{user.username}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
