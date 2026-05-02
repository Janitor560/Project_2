'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Trophy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

export default function SignInPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get('callbackUrl') ?? '/';
  const { toast }    = useToast();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);

    if (res?.error) {
      toast('error', 'Sign in failed', 'Invalid email or password');
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-700 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <Trophy className="h-8 w-8 text-gold-400" /> AwardsPro
          </Link>
        </div>

        <div className="card p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 justify-center mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-brand-600 font-medium hover:underline">Register</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 p-4 text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-700">Demo accounts:</p>
            <p>Admin: <span className="font-mono">admin@awardsplatform.com / admin123</span></p>
            <p>Vendor: <span className="font-mono">vendor1@awardsplatform.com / vendor123</span></p>
            <p>Customer: <span className="font-mono">customer@example.com / customer123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
