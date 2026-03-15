'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function HomePage() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (token) {
      router.replace('/board');
      return;
    }
  }, [token, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-slate-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-100 p-4">
      <h1 className="text-2xl font-semibold text-slate-800">Collaborator</h1>
      <p className="text-slate-600">Team task board</p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-slate-800 px-5 py-2.5 font-medium text-white hover:bg-slate-700"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
