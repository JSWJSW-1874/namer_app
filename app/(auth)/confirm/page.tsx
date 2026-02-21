'use client';

// Email confirmation landing page.
// Supabase redirects here after the user clicks the confirmation link.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'confirmed' | 'error'>('checking');

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setStatus('confirmed');
      } else if (event === 'USER_UPDATED') {
        setStatus('confirmed');
      }
    });

    // Check if already signed in
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus('confirmed');
      else setStatus('error');
    });
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-slate-500 text-sm">Confirming your account...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-bold text-slate-900">Something went wrong.</h1>
          <p className="text-slate-600 text-sm">
            The confirmation link may have expired. Try signing up again or contact us.
          </p>
          <Button onClick={() => router.push('/signup')}>Back to sign up</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Card className="max-w-md w-full text-center space-y-4">
        <div className="text-4xl">✓</div>
        <h1 className="text-xl font-bold text-slate-900">You&apos;re confirmed.</h1>
        <p className="text-slate-600 text-sm">
          Your account is active. Let&apos;s find your baseline.
        </p>
        <Button onClick={() => router.push('/day0')} className="w-full">
          Go to Day 0 — find your baseline
        </Button>
      </Card>
    </div>
  );
}
