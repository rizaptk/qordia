
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type RevenueByPlanChartProps = {
  data: { name: string, revenue: number }[]
}

export function RevenueByPlanChart({ data }: RevenueByPlanChartProps) {
  if (!data || data.length === 0) {
      return <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">Not enough data to display chart.</div>
  }
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={{ fill: "hsl(var(--foreground))" }}
        />
        <YAxis 
            tickFormatter={(value) => `$${value}`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
      </BarChart>
    </ChartContainer>
  )
}
