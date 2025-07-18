'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { LoginForm } from '../../../components/auth/LoginForm';
import { useTranslation } from '../../../i18n';

function LoginPageContent() {
  const { t } = useTranslation('ja');
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnTo || '/main');
    }
  }, [isAuthenticated, router, returnTo]);

  const handleLoginSuccess = () => {
    setTimeout(() => {
      router.push(returnTo || '/main');
    }, 1000);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('auth.loginTitle')}
        </h1>
        <p className="text-white/70">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      <LoginForm onSuccess={handleLoginSuccess} />

      <div className="mt-6 text-center">
        <Link
          href="/forgot-password"
          className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
        >
          {t('auth.forgotPassword')}
        </Link>
      </div>

      <div className="mt-6 text-center text-sm text-white/70">
        {t('auth.registerPrompt')}{' '}
        <Link
          href={`/register${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          {t('auth.registerLink')}
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-white/20 text-center">
        <Link
          href="/main"
          className="inline-block px-6 py-2 text-white/80 hover:text-white border border-white/30 hover:border-white/50 rounded-lg transition-all duration-200 hover:bg-white/10"
        >
          {t('auth.browseContinue')}
        </Link>
        <p className="text-xs text-white/50 mt-2">
          {t('auth.skipLogin')}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}