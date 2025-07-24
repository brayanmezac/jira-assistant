'use client';

import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { AppLogo } from '../AppLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function Login() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect them.
    if (!authLoading && user) {
      router.push('/');
      return;
    }

    const processRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        // If result is not null, onAuthStateChanged in AuthProvider will handle the user state
        // and its own useEffect will handle the redirect.
      } catch (redirectError: any) {
        console.error('Error during redirect sign in', redirectError);
        if (redirectError.code !== 'auth/network-request-failed') {
          setError(redirectError.message);
        }
      } finally {
        setIsProcessingRedirect(false);
      }
    };

    processRedirectResult();
  }, [user, authLoading, router]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (signInError: any) {
      console.error('Error starting sign in with redirect', signInError);
      setError(signInError.message);
      setIsSigningIn(false);
    }
  };
  
  // Show a loading spinner while checking for redirect result or if auth is loading.
  if (isProcessingRedirect || authLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <AppLogo />
            </div>
          <CardTitle className="text-2xl">Welcome to Jira Assist</CardTitle>
          <CardDescription>
            Sign in with your Google account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={handleSignIn} disabled={isSigningIn}>
            {(isSigningIn) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Sign in with Google
          </Button>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
