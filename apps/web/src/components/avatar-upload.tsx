"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateAvatar } from "@/lib/actions/profile";

const MAX_SIZE = 2 * 1024 * 1024;

export function AvatarUpload({
  userId,
  avatarUrl,
  fullName,
  email,
}: {
  userId: string;
  avatarUrl: string | null;
  fullName: string | null;
  email: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = fullName || email;

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setError("Image is too large — max 2 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, WebP).");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/avatar.${ext}`;
      const supabase = createClient();

      const old = await supabase.storage.from("avatars").list(userId);
      if (old.error) throw new Error(old.error.message);
      if (old.data.length > 0) {
        await supabase.storage
          .from("avatars")
          .remove(old.data.map((o) => `${userId}/${o.name}`));
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);

      const publicUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      const result = await updateAvatar({ url: publicUrl });
      if ("error" in result) throw new Error(result.error);

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload photo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Change profile photo"
        className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--navy)] text-2xl font-extrabold text-white ring-4 ring-[var(--surface)] transition-shadow hover:ring-[var(--accent)]/40 disabled:opacity-60"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <span>
            {displayName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join("")}
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 bg-black/40 py-1 text-[10px] font-semibold text-white opacity-90">
          {uploading ? "Uploading…" : "Change"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
