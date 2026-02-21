'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, writeBatch, arrayUnion } from 'firebase/firestore';
import type { TenantInvitation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '../ui/button';

export function InvitationHandler() {
  const { user, userProfile } = useAuthStore();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [invitation, setInvitation] = useState<TenantInvitation | null>(null);

  const invitationsRef = useMemoFirebase(() => 
    (firestore && user?.email)
      ? query(
          collection(firestore, 'invitations'), 
          where('email', '==', user.email),
          where('status', '==', 'pending')
        ) 
      : null,
    [firestore, user]
  );
  const { data: pendingInvitations } = useCollection<TenantInvitation>(invitationsRef);
  
  useEffect(() => {
    if (userProfile?.role && userProfile.role !== 'customer') return;

    if (pendingInvitations && pendingInvitations.length > 0) {
      setInvitation(pendingInvitations[0]);
    } else {
      setInvitation(null);
    }
  }, [pendingInvitations, userProfile]);

  const handleAccept = async () => {
    if (!firestore || !user || !invitation) return;

    const batch = writeBatch(firestore);

    const userRef = doc(firestore, 'users', user.uid);
    batch.update(userRef, {
      tenantId: invitation.tenantId,
      role: invitation.role,
    });

    const tenantRef = doc(firestore, 'tenants', invitation.tenantId);
    batch.update(tenantRef, {
      staffUids: arrayUnion(user.uid)
    });

    const invitationRef = doc(firestore, 'invitations', invitation.id);
    batch.update(invitationRef, { status: 'accepted' });

    try {
      await batch.commit();
      toast({
        title: "Welcome to the Team!",
        description: `You have successfully joined ${invitation.tenantName}.`,
      });
      setInvitation(null);
      // Force token refresh to get new custom claims
      await user.getIdToken(true);
      // Reload to apply new role and redirect
      window.location.reload();
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      toast({
        variant: "destructive",
        title: "Acceptance Failed",
        description: "Could not process your acceptance. Please try again."
      });
    }
  };

  const handleDecline = async () => {
     if (!firestore || !invitation) return;
     const invitationRef = doc(firestore, 'invitations', invitation.id);
     const batch = writeBatch(firestore);
     batch.update(invitationRef, { status: 'declined' });
     await batch.commit();
     setInvitation(null);
  }

  if (!invitation || !user) {
    return null;
  }

  return (
    <AlertDialog open={!!invitation}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>You're Invited!</AlertDialogTitle>
          <AlertDialogDescription>
            You have been invited to join <span className="font-bold">{invitation.tenantName}</span> as a <span className="font-bold">{invitation.role}</span>.
            Would you like to accept?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={handleDecline}>Decline</Button>
          <Button onClick={handleAccept}>Accept Invitation</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
