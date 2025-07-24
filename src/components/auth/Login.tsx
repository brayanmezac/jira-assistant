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
    // This effect should only run once when the component mounts and auth is ready.
    if (authLoading) {
      return; // Wait until the AuthProvider has determined the initial auth state.
    }
    
    // If there is already a user, AuthProvider will handle the redirect.
    if (user) {
      setIsProcessingRedirect(false);
      return;
    }

    const processRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // A user has successfully signed in via redirect.
          // The onAuthStateChanged listener in AuthProvider will now pick up the new user
          // and handle the redirect to the main application. We don't need to do it here.
          // We can simply stop showing the loading state.
        }
      } catch (redirectError: any) {
        console.error('Error getting redirect result:', redirectError);
        // Make the error visible to the user on the login page.
        setError(`Login failed: ${redirectError.message} (Code: ${redirectError.code})`);
      } finally {
        setIsProcessingRedirect(false);
      }
    };
    
    processRedirect();

  }, [authLoading, user]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      // We don't need to await this. The browser will navigate away.
      await signInWithRedirect(auth, provider);
    } catch (signInError: any) {
      console.error('Error starting sign-in with redirect:', signInError);
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

  // Do not render the login form if a user is already authenticated
  // and AuthProvider is about to redirect.
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
