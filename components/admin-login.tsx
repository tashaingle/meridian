"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { loginAdminAction } from "@/lib/actions";

export function AdminLogin() {
  const router = useRouter();
  const [state, action, pending] = useActionState(loginAdminAction, null);

  useEffect(() => {
    if (state && !state.error) router.refresh();
  }, [router, state]);

  return (
    <form action={action} className="max-w-sm space-y-3 rounded-2xl border border-line bg-card p-4">
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Staff password</span>
        <input name="password" type="password" required className="h-11 w-full rounded-xl border border-line px-3" />
      </label>
      {state?.error && <p className="text-sm text-copper">{state.error}</p>}
      <button type="submit" disabled={pending} className="h-11 rounded-full bg-sea px-5 font-semibold text-white">
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
