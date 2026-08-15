"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@snews/ui";
import { createClient } from "@/lib/supabase/client";
import { saveResume, removeResume } from "@/lib/actions/profile";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export function ResumeCard({
  userId,
  resumeUrl,
  resumeName,
  downloadUrl,
}: {
  userId: string;
  resumeUrl: string | null;
  resumeName: string | null;
  downloadUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setMessage({ kind: "error", text: "File is too large — max 5 MB." });
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const path = `${userId}/resume.${ext}`;

    setUploading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const old = await supabase.storage.from("resumes").list(userId);
      if (old.error) throw new Error(old.error.message);
      if (old.data.length > 0) {
        const { error: removeError } = await supabase.storage
          .from("resumes")
          .remove(old.data.map((o) => `${userId}/${o.name}`));
        if (removeError) throw new Error(removeError.message);
      }

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);

      const result = await saveResume({ url: path, name: file.name });
      if ("error" in result) throw new Error(result.error);

      setMessage({ kind: "ok", text: "Resume uploaded." });
      router.refresh();
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!resumeUrl) return;
    setRemoving(true);
    setMessage(null);
    try {
      const result = await removeResume();
      if ("error" in result) throw new Error(result.error);
      setMessage({ kind: "ok", text: "Resume removed." });
      router.refresh();
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Could not remove resume." });
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {resumeUrl ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <span aria-hidden className="text-lg">
            📄
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--ink)]">{resumeName}</p>
            <p className="text-xs text-[var(--muted)]">PDF or Word · max 5 MB</p>
          </div>
          {downloadUrl ? (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent-dark)] transition-colors hover:bg-[var(--accent)]/10"
            >
              Download
            </a>
          ) : null}
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Replace
          </Button>
          <Button type="button" variant="danger" size="sm" loading={removing} onClick={handleRemove}>
            Remove
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-center">
          <p className="text-sm font-semibold text-[var(--ink)]">No resume uploaded yet</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Share your PDF or Word resume — private to you, used when you register for opportunities.
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => inputRef.current?.click()}>
            Upload resume
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {uploading ? (
        <p className="text-sm font-medium text-[var(--muted)]">Uploading…</p>
      ) : message ? (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={`text-sm font-medium ${message.kind === "error" ? "text-red-600" : "text-emerald-600"}`}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
