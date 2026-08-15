import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const FIELD_CLASSES =
  "w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--ink)] " +
  "placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none " +
  "focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors";

export interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  id: string;
}

export interface InputProps extends FieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className = "", ...rest },
  ref,
) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <input
        ref={ref}
        id={id}
        className={`${FIELD_CLASSES} h-11 ${error ? "border-red-500" : ""} ${className}`}
        aria-invalid={Boolean(error)}
        {...rest}
      />
    </FieldShell>
  );
});

export interface TextareaProps
  extends FieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, className = "", ...rest },
  ref,
) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <textarea
        ref={ref}
        id={id}
        className={`${FIELD_CLASSES} min-h-24 py-2.5 ${error ? "border-red-500" : ""} ${className}`}
        aria-invalid={Boolean(error)}
        {...rest}
      />
    </FieldShell>
  );
});

export interface SelectProps
  extends FieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, id, className = "", children, ...rest },
  ref,
) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <select
        ref={ref}
        id={id}
        className={`${FIELD_CLASSES} h-11 ${error ? "border-red-500" : ""} ${className}`}
        aria-invalid={Boolean(error)}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
});

function FieldShell({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-[var(--ink)]">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
