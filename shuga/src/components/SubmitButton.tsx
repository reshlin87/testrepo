"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingText = "Saving…", className = "btn block" }: { children: React.ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
