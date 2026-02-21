'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export type ShiftSummaryData = {
    totalOrders: number;
    totalSales: number;
    totalRefunds: number;
};

type ShiftSummaryDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    summary: ShiftSummaryData | null;
};

function SummaryRow({ label, value, className }: { label: string; value: string; className?: string }) {
    return (
        <div className="flex justify-between items-center">
            <p className="text-muted-foreground">{label}</p>
            <p className={`font-semibold ${className}`}>{value}</p>
        </div>
    );
}

export function ShiftSummaryDialog({ isOpen, onOpenChange, summary }: ShiftSummaryDialogProps) {
    const [declaredCash, setDeclaredCash] = useState<string>('');

    const variance = useMemo(() => {
        const expected = summary?.totalSales || 0;
        const declared = parseFloat(declaredCash) || 0;
        return declared - expected;
    }, [declaredCash, summary]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setDeclaredCash('');
        }
        onOpenChange(open);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>End of Shift Summary</DialogTitle>
                    <DialogDescription>Review your shift activity before closing out.</DialogDescription>
                </DialogHeader>
                
                {summary ? (
                    <div className="space-y-4 py-4">
                        <SummaryRow label="Total Orders Processed" value={summary.totalOrders.toString()} />
                        <SummaryRow label="Total Sales (Cash & Digital)" value={`$${summary.totalSales.toFixed(2)}`} />
                        <SummaryRow label="Total Refunds" value={`-$${summary.totalRefunds.toFixed(2)}`} />
                        
                        <Separator />

                        <div className="space-y-2">
                             <Label htmlFor="declared-cash">Declared Cash</Label>
                             <Input 
                                id="declared-cash" 
                                type="number" 
                                placeholder="0.00"
                                value={declaredCash}
                                onChange={(e) => setDeclaredCash(e.target.value)}
                             />
                             <p className="text-xs text-muted-foreground">Enter the total cash amount counted from the register.</p>
                        </div>

                         <Separator />

                         <SummaryRow label="Expected in Register" value={`$${(summary.totalSales).toFixed(2)}`} />
                         <SummaryRow 
                            label="Variance" 
                            value={`${variance < 0 ? '-' : ''}$${Math.abs(variance).toFixed(2)}`}
                            className={variance === 0 ? '' : variance > 0 ? 'text-green-500' : 'text-destructive'}
                         />

                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        Calculating shift summary...
                    </div>
                )}
                
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" disabled>
                        Confirm & Close Shift
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
