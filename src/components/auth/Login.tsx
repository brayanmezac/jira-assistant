'use client';

import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { AppLogo } from '../AppLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirect = async () => {
        setIsLoading(true);
        try {
            const result = await getRedirectResult(auth);
            // If result is not null, the user has successfully signed in.
            // The AuthProvider will handle the redirect to the main page.
            // If result is null, it means we are on the initial load of the login page.
        } catch (redirectError: any) {
            console.error('Error during redirect sign in', redirectError);
            setError(redirectError.message);
        } finally {
            setIsLoading(false);
        }
    };
    checkRedirect();
  }, []);


  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      // We don't need to await this, it will trigger a page redirect.
      signInWithRedirect(auth, provider);
    } catch (signInError: any) {
      console.error('Error starting sign in with redirect', signInError);
      setError(signInError.message);
      setIsLoading(false);
    }
  };

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
          <Button className="w-full" onClick={handleSignIn} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
