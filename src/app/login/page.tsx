
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, getAdditionalUserInfo } from 'firebase/auth';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { QordiaLogo } from '@/components/logo';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from 'lucide-react';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { seedNewTenant } from '@/firebase/seed-tenant';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { isAuthenticated, isManager, isPlatformAdmin, isBarista, isService, isCashier, isLoading } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }

    // Redirect based on role priority
    if (isPlatformAdmin) {
      router.replace('/platform');
      return;
    }
    if (isManager) {
      router.replace('/staff'); // Manager gets the full dashboard
      return;
    }
    if (isBarista) {
        router.replace('/staff/pds');
        return;
    }
    if (isService) {
        router.replace('/staff/runner');
        return;
    }
    if (isCashier) {
        router.replace('/staff/cashier');
        return;
    }
    
    // Fallback for customer or unexpected roles
    router.replace('/');
    
  }, [isAuthenticated, isPlatformAdmin, isManager, isBarista, isService, isCashier, isLoading, router]);

  const handleEmailLogin = async (data: LoginFormValues) => {
    if (!auth) return;
    setAuthError(null);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        if (userCredential.user.providerData.some(p => p.providerId === 'password') && !userCredential.user.emailVerified) {
          await auth.signOut();
          setAuthError('Please verify your email address before signing in. Check your inbox for a verification link.');
          return;
        }
    } catch (error: any) {
        setAuthError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) return;
    setAuthError(null);
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const additionalUserInfo = getAdditionalUserInfo(userCredential);

        if (additionalUserInfo?.isNewUser) {
            const newUser = userCredential.user;

            // Create the associated Tenant document in Firestore
            const tenantData = {
                name: `${newUser.displayName || newUser.email?.split('@')[0]}'s Cafe`,
                ownerId: newUser.uid,
                createdAt: Timestamp.now(),
                planId: 'plan_free', // Assign the default free plan
                subscriptionStatus: 'trialing',
                nextBillingDate: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)), // 14 day trial
            };
            const tenantRef = await addDocumentNonBlocking(collection(firestore, 'tenants'), tenantData);
            
            if (!tenantRef?.id) {
              throw new Error("Failed to create tenant document.");
            }

            // Create the user's profile document in Firestore with the manager role
            const userProfileData = {
                email: newUser.email,
                name: newUser.displayName || newUser.email?.split('@')[0],
                role: 'manager',
                tenantId: tenantRef.id,
                createdAt: Timestamp.now(),
            };
            await setDoc(doc(firestore, 'users', newUser.uid), userProfileData);
            
            // Seed the new tenant with sample data
            await seedNewTenant(firestore, tenantRef.id, newUser.uid);
        }
        // For both new and existing users, the useEffect will handle redirection.

    } catch(error: any) {
        setAuthError(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      { isLoading || isAuthenticated ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
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
      )}
    </div>
  );
}
