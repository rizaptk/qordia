'use client';

import { useState } from 'react';
import type { Order } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { getSalesSummary } from '@/app/actions/summarize-sales';

type AiSummaryCardProps = {
    completedOrders: Order[];
    shopName: string;
};

export function AiSummaryCard({ completedOrders, shopName }: AiSummaryCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        setError(null);
        setSummary(null);
        try {
            const result = await getSalesSummary(completedOrders, shopName);
            setSummary(result);
        } catch (err) {
            setError("Failed to generate summary. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary" />
                    AI-Powered Analytics Assistant
                </CardTitle>
                <CardDescription>
                    Get instant, natural-language insights from your sales data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex items-center justify-center h-24 text-muted-foreground">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span>Analyzing your data...</span>
                    </div>
                )}
                {error && (
                    <div className="text-destructive bg-destructive/10 p-3 rounded-md">
                        {error}
                    </div>
                )}
                {summary && (
                    <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/50 p-4 rounded-md"
                         dangerouslySetInnerHTML={{ __html: summary.replace(/\*/g, '•') }} // Basic markdown support
                    />
                )}
            </CardContent>
            <CardFooter>
                 <Button onClick={handleGenerateSummary} disabled={isLoading || completedOrders.length === 0}>
                    {isLoading ? 'Generating...' : 'Generate Summary'}
                </Button>
                {completedOrders.length === 0 && !isLoading && (
                    <p className="text-xs text-muted-foreground ml-4">
                        Not enough data to generate a summary.
                    </p>
                )}
            </CardFooter>
        </Card>
    );
}
