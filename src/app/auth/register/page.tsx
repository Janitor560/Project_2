'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Trophy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

export default function RegisterPage() {
  const router   = useRouter();
  const { toast } = useToast();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [address,  setAddress]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, address }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast('error', 'Registration failed', data.error ?? 'Please try again');
      setLoading(false);
      return;
    }

    // Auto sign in after registration
    await signIn('credentials', { email, password, redirect: false });
    router.push('/products');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-700 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <Trophy className="h-8 w-8 text-gold-400" /> AwardsPro
          </Link>
        </div>

        <div className="card p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-6">Start designing custom awards today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required minLength={6}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Delivery Address <span className="text-gray-400">(optional)</span></label>
              <input type="text" className="input" placeholder="123 Main St, City, State, ZIP" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 justify-center mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
