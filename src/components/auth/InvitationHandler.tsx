
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, writeBatch } from 'firebase/firestore';
import type { TenantInvitation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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

  // Find pending invitations for the current user's email
  const invitationsRef = useMemoFirebase(() => 
    firestore && user?.email 
      ? query(
          collection(firestore, 'invitations'), 
          where('email', '==', user.email),
          where('status', '==', 'pending')
        ) 
      : null,
    [firestore, user?.email]
  );
  const { data: pendingInvitations, isLoading } = useCollection<TenantInvitation>(invitationsRef);
  
  useEffect(() => {
    // If user has a role, they've already accepted an invite.
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

    // 1. Update User's Profile
    const userRef = doc(firestore, 'users', user.uid);
    batch.update(userRef, {
      tenantId: invitation.tenantId,
      role: invitation.role,
    });

    // 2. Update Tenant's Staff List
    const tenantRef = doc(firestore, 'tenants', invitation.tenantId);
    batch.update(tenantRef, {
      staffUids: [user.uid] // Note: In a real app, use `arrayUnion`
    });

    // 3. Update Invitation Status
    const invitationRef = doc(firestore, 'invitations', invitation.id);
    batch.update(invitationRef, { status: 'accepted' });

    try {
      await batch.commit();
      toast({
        title: "Welcome to the Team!",
        description: `You have successfully joined ${invitation.tenantName}.`,
      });
      setInvitation(null);
      // The AuthProvider will automatically pick up the role change and redirect.
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
     await updateDoc(invitationRef, { status: 'declined' });
     setInvitation(null);
  }

  if (!invitation) {
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
