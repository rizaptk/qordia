'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth, useUserClaims, useFirestore } from '@/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { addDoc, collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { QordiaLogo } from '@/components/logo';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useAuthStore();
  const { claims, isLoading: areClaimsLoading } = useUserClaims();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    // If registration was just successful, do not redirect. Let the user see the message.
    if (isSuccess || isUserLoading || areClaimsLoading) return;

    if (user && claims) {
      if (claims.platform_admin === true) {
        router.push('/platform');
      } else if (claims.role && ['manager', 'barista', 'service'].includes(claims.role)) {
        router.push('/staff');
      } else {
        router.push('/');
      }
    }
  }, [user, isUserLoading, claims, areClaimsLoading, router, isSuccess]);

  const handleEmailRegister = async (data: RegisterFormValues) => {
    if (!auth || !firestore) return;
    setAuthError(null);
    try {
        // Create the user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const newUser = userCredential.user;

        // Create the associated Tenant document in Firestore
        const tenantData = {
            name: `${newUser.displayName || data.email.split('@')[0]}'s Cafe`,
            ownerId: newUser.uid,
            createdAt: Timestamp.now(),
            planId: 'plan_basic', // Assign a default trial/basic plan
            subscriptionStatus: 'trialing',
            nextBillingDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30-day trial
        };
        const tenantRef = await addDoc(collection(firestore, 'tenants'), tenantData);

        // Create the user's profile document in Firestore with the manager role
        const userProfileData = {
            email: newUser.email,
            name: newUser.displayName || data.email.split('@')[0],
            role: 'manager',
            tenantId: tenantRef.id,
            createdAt: Timestamp.now(),
        };
        await setDoc(doc(firestore, 'users', newUser.uid), userProfileData);
        
        // Send verification email and sign out to force verification
        await sendEmailVerification(userCredential.user);
        await auth.signOut(); // Sign out FIRST to prevent redirect
        setIsSuccess(true); // THEN update the UI to show success message

    } catch (error: any) {
        setAuthError(error.message);
    }
  };

  if (isUserLoading || areClaimsLoading || (user && !isSuccess)) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <QordiaLogo className="w-12 h-12 text-primary" />
            </div>
          <CardTitle>Create a Business Account</CardTitle>
          <CardDescription>Sign up to start managing your business</CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
             <div className="space-y-4">
                <Alert variant="default" className="border-green-500/50 text-green-700 dark:border-green-600/50 dark:text-green-300">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertTitle>Verification Email Sent!</AlertTitle>
                    <AlertDescription>
                        Your business account has been created. Please check your inbox to verify your email address before signing in.
                    </AlertDescription>
                </Alert>
                <Button asChild className="w-full">
                    <Link href="/login">Proceed to Login</Link>
                </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEmailRegister)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@yourcafe.com" {...field} />
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
                      <FormLabel>Password</FormLabel>
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
                      <AlertTitle>Registration Failed</AlertTitle>
                      <AlertDescription>{authError.replace('Firebase: ', '')}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Creating Account..." : "Create Business Account"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        {!isSuccess && (
            <CardFooter className="justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account? <Link href="/login" className="text-primary hover:underline">Sign In</Link>
                </p>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
