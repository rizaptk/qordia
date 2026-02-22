
"use client";

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

export type ShiftSummaryData = {
    openingFloat: number;
    totalOrders: number;
    totalSales: number; // For now, this is total sales, not just cash sales
    totalRefunds: number;
};

type ShiftSummaryDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    summary: ShiftSummaryData | null;
    onConfirm: (declaredCash: number, variance: number) => Promise<void>;
};

function SummaryRow({ label, value, className }: { label: string; value: string; className?: string }) {
    return (
        <div className="flex justify-between items-center">
            <p className="text-muted-foreground">{label}</p>
            <p className={`font-semibold ${className}`}>{value}</p>
        </div>
    );
}

export function ShiftSummaryDialog({ isOpen, onOpenChange, summary, onConfirm }: ShiftSummaryDialogProps) {
    const [declaredCash, setDeclaredCash] = useState<string>('');
    const [isClosing, setIsClosing] = useState(false);

    const { expectedCash, variance } = useMemo(() => {
        const openingFloat = summary?.openingFloat || 0;
        const totalSales = summary?.totalSales || 0;
        // In a real scenario, you'd want to subtract digital payments from totalSales
        // and only add cash refunds, but for now we use total values.
        const expectedCashInDrawer = openingFloat + totalSales - (summary?.totalRefunds || 0);
        const declared = parseFloat(declaredCash) || 0;
        const variance = declared - expectedCashInDrawer;
        return { expectedCash: expectedCashInDrawer, variance };
    }, [declaredCash, summary]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setDeclaredCash('');
            setIsClosing(false);
        }
        onOpenChange(open);
    }
    
    const handleConfirm = async () => {
        setIsClosing(true);
        await onConfirm(parseFloat(declaredCash) || 0, variance);
        setIsClosing(false);
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
                        
                        <SummaryRow label="Opening Float" value={`$${summary.openingFloat.toFixed(2)}`} />

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

                         <SummaryRow label="Expected in Register" value={`$${expectedCash.toFixed(2)}`} />
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
                    <Button variant="destructive" onClick={handleConfirm} disabled={isClosing || !declaredCash}>
                        {isClosing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isClosing ? 'Closing...' : 'Confirm & Close Shift'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
