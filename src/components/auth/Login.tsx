'use client';

import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { AppLogo } from '../AppLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';

export function Login() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const processRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        // If 'result' is not null, a user has successfully signed in.
        // The onAuthStateChanged listener in AuthProvider will handle the user state
        // and redirect to the main application. We don't need to do anything here.
        if (result) {
          // User is signed in. AuthProvider will handle redirect.
        }
      } catch (redirectError: any) {
        console.error('Error getting redirect result:', redirectError);
        setError(redirectError.message || 'An unknown error occurred during sign-in.');
      } finally {
        setIsProcessingRedirect(false);
      }
    };
    
    // Process the redirect result when the component mounts and auth is ready.
    if (!authLoading && !user) {
        processRedirect();
    } else if (!authLoading && user) {
        // User is already logged in, AuthProvider handles redirects.
        setIsProcessingRedirect(false);
    }
  }, [authLoading, user]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // After this, the page will redirect to Google and then back to this page.
      // The useEffect hook will handle the result.
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
