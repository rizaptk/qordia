'use client';

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

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center">
            <p className="text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    );
}

export function ShiftSummaryDialog({ isOpen, onOpenChange, summary }: ShiftSummaryDialogProps) {
    
    // For now, these are just placeholders. Will be implemented in the next tasks.
    const declaredCash = 0;
    const variance = (summary?.totalSales || 0) - declaredCash;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>End of Shift Summary</DialogTitle>
                    <DialogDescription>Review your shift activity before closing out.</DialogDescription>
                </DialogHeader>
                
                {summary ? (
                    <div className="space-y-4 py-4">
                        <SummaryRow label="Total Orders Processed" value={summary.totalOrders.toString()} />
                        <SummaryRow label="Total Sales" value={`$${summary.totalSales.toFixed(2)}`} />
                        <SummaryRow label="Total Refunds" value={`-$${summary.totalRefunds.toFixed(2)}`} />
                        
                        <Separator />

                        <div className="space-y-2">
                             <Label htmlFor="declared-cash">Declared Cash</Label>
                             <Input id="declared-cash" type="number" placeholder="0.00" disabled />
                             <p className="text-xs text-muted-foreground">Enter the total cash amount counted from the register.</p>
                        </div>

                         <Separator />

                         <SummaryRow label="Expected in Register" value={`$${(summary.totalSales).toFixed(2)}`} />
                         <SummaryRow label="Variance" value={`${variance < 0 ? '-' : ''}$${Math.abs(variance).toFixed(2)}`} />

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
