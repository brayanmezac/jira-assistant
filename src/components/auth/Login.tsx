'use client';

import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { AppLogo } from '../AppLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';

export function Login() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      setIsProcessingRedirect(false);
      return; 
    }

    const processRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User is signed in. AuthProvider will handle the redirect.
        }
      } catch (redirectError: any) {
        console.error('Error getting redirect result:', redirectError);
        setError(`Login failed: ${redirectError.message} (Code: ${redirectError.code})`);
      } finally {
        setIsProcessingRedirect(false);
      }
    };
    
    processRedirect();

  }, [authLoading, user]);

  const handleAuthAction = async () => {
    setIsSigningIn(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // The browser will redirect, so no further action is needed here.
    } catch (signInError: any) {
      console.error('Error starting sign-in with redirect:', signInError);
      setError(`An error occurred: ${signInError.message}`);
      setIsSigningIn(false);
    }
  };
  
  if (isProcessingRedirect || authLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (user) {
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
          <CardTitle className="text-2xl">Jira Assist</CardTitle>
          <CardDescription>
            Register or sign in with your Google account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Button onClick={handleAuthAction} disabled={isSigningIn}>
              {isSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Register with Google
            </Button>
            <Button onClick={handleAuthAction} disabled={isSigningIn}>
              {isSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Login with Google
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded-md">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
