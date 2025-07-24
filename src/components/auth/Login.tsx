'use client';

import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { AppLogo } from '../AppLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkRedirect = async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result) {
              // User successfully signed in. Redirect to home page.
              router.push('/');
              return; // Stop further execution in this component
            }
        } catch (redirectError: any) {
            console.error('Error during redirect sign in', redirectError);
            if (redirectError.code !== 'auth/network-request-failed') {
               setError(redirectError.message);
            }
        } finally {
            // Only set loading to false if there was no redirect result
            // If there was a result, we are navigating away anyway.
            if (!auth.currentUser) {
              setIsLoading(false);
            }
        }
    };
    checkRedirect();
  }, [router]);


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

  if (isLoading) {
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
