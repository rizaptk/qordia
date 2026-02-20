'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useUserClaims } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { QordiaLogo } from '@/components/logo';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from 'lucide-react';


const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { claims, isLoading: areClaimsLoading } = useUserClaims();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    // Don't redirect until we have a definitive auth state
    if (isUserLoading || areClaimsLoading || !user) {
      return;
    }

    if (claims) {
      if (claims.platform_admin === true) {
        router.replace('/platform');
        return;
      }
      if (claims.role && ['manager', 'barista', 'service'].includes(claims.role)) {
        router.replace('/staff');
        return;
      }
    }
    
    // Fallback for anyone else (customers, users with no role)
    router.replace('/');
    
  }, [user, isUserLoading, claims, areClaimsLoading, router]);

  const handleEmailLogin = async (data: LoginFormValues) => {
    if (!auth) return;
    setAuthError(null);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        // Check if the user's email is verified, but only if they used email/password provider.
        if (userCredential.user.providerData.some(p => p.providerId === 'password') && !userCredential.user.emailVerified) {
          await auth.signOut(); // Log them out immediately
          setAuthError('Please verify your email address before signing in. Check your inbox for a verification link.');
          return; // Stop execution
        }
        // Successful sign-in will be handled by the useEffect
    } catch (error: any) {
        setAuthError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setAuthError(null);
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        // Successful sign-in will be handled by the useEffect
    } catch(error: any) {
        setAuthError(error.message);
    }
  };

  // If user is logged in, show a loading state while we redirect them.
  if (isUserLoading || areClaimsLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Otherwise, show the login form.
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <QordiaLogo className="w-12 h-12 text-primary" />
            </div>
          <CardTitle>Qordia Portal</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="manager@qordia.cafe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link href="/forgot-password"
                          className="text-sm font-medium text-primary hover:underline"
                          tabIndex={-1}>
                          Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {authError && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>{authError.replace('Firebase: ', '')}</AlertDescription>
                 </Alert>
              )}
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
            Sign in with Google
          </Button>

        </CardContent>
        <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
                Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign Up</Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
