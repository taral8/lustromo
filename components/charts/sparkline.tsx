"use client"

import { LineChart, Line } from "recharts"

interface SparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
}

export function Sparkline({ data, color, width = 80, height = 24 }: SparklineProps) {
  const isPositive = data.length > 1 && data[data.length - 1] >= data[0]
  const lineColor = color ?? (isPositive ? "#10B981" : "#EF4444")
  const chartData = data.map((value, index) => ({ index, value }))

  return (
    <LineChart width={width} height={height} data={chartData}>
      <Line
        type="monotone"
        dataKey="value"
        stroke={lineColor}
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  )
}
