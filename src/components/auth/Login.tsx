'use client';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { AppLogo } from '../AppLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The AuthProvider will handle the redirect, so we don't need to setIsLoading(false) here on success.
    } catch (error) {
      console.error('Error signing in with Google', error);
      // If there's an error (like the user closing the popup), re-enable the button.
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
        <CardContent>
          <Button className="w-full" onClick={handleSignIn} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
