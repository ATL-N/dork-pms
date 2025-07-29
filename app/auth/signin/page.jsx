'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      console.log('there was an error logging the user in.', result?.error)
      setError(result.error);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 card">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 input"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 input"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full btn-primary"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <p>
            Want to create your own farm?{' '}
            <a href="/auth/signup" className="font-medium text-[color:var(--primary)] hover:text-[color:var(--primary-dark)]">
              Apply here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
