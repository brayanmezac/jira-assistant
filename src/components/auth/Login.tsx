
'use client';

import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { AppLogo } from '../AppLogo';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { doc, setDoc } from 'firebase/firestore';

export function Login() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      router.push('/');
      return;
    }

    const processRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User is signed in via redirect. AuthProvider will handle the redirect to '/'.
        }
      } catch (redirectError: any) {
        console.error('Error getting redirect result:', redirectError);
        setError(
          `Login failed: ${redirectError.message} (Code: ${redirectError.code})`
        );
      } finally {
        setIsProcessingRedirect(false);
      }
    };

    processRedirect();
  }, [authLoading, user, router]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (signInError: any)
{
      console.error('Error starting sign-in with redirect:', signInError);
      setError(`An error occurred: ${signInError.message}`);
      setIsSigningIn(false);
    }
  };

  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Create a document for the user in Firestore to link auth with DB records
      // This is crucial for Firestore security rules to work correctly.
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        displayName: userCredential.user.email, // Default display name to email
        createdAt: new Date(),
      });
      // AuthProvider will handle the redirect after successful registration
    } catch (manualError: any) {
      setError(`Registration failed: ${manualError.message}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // AuthProvider will handle the redirect
    } catch (manualError: any) {
      setError(`Login failed: ${manualError.message}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isProcessingRedirect || authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl">Jira Assist</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSigningIn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSigningIn}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" className="w-full" disabled={isSigningIn}>
                {isSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Login
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleManualRegister}
                className="w-full"
                disabled={isSigningIn}
              >
                {isSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Register
              </Button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full"
            disabled={isSigningIn}
          >
            {isSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign in with Google
          </Button>
        </CardContent>
        {error && (
          <CardFooter>
            <p className="w-full text-sm text-destructive text-center p-2 bg-destructive/10 rounded-md">
              {error}
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
