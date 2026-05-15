"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "motion/react"

import { getCategoryChartData } from "@/actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatBRL } from "@/lib/money"

const PALETTE = [
	"#f87185",
	"#fb923c",
	"#facc15",
	"#4bde7c",
	"#38bdf8",
	"#a78bfa",
	"#f472b6",
	"#34d399",
]

export function CategoryChart() {
	const { data, isLoading } = useQuery({
		queryKey: ["category-chart"],
		queryFn: getCategoryChartData,
	})

	if (isLoading) {
		return <Skeleton className="h-[300px] rounded-xl" />
	}

	if (!data?.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
						Despesas por categoria
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Nenhuma despesa registrada este mês.
					</p>
				</CardContent>
			</Card>
		)
	}

	const total = data.reduce((s, d) => s + d.value, 0)
	const top = data[0]

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between gap-4">
					<CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
						Despesas por categoria
					</CardTitle>
					<div className="text-right">
						<p className="financial-value text-lg font-bold tabular-nums">
							{formatBRL(total)}
						</p>
						<p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">
							Total — este mês
						</p>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<div className="flex flex-col gap-3">
					{data.map((item, index) => {
						const pct = total > 0 ? (item.value / total) * 100 : 0
						const color = PALETTE[index % PALETTE.length]
						const isTop = item.name === top.name

						return (
							<div key={item.name} className="group flex flex-col gap-1.5">
								<div className="flex items-center justify-between gap-2">
									<div className="flex items-center gap-2 min-w-0">
										<span
											className="shrink-0 text-[0.6rem] font-bold tabular-nums"
											style={{ color: "#2d4a38", minWidth: 16 }}
										>
											{String(index + 1).padStart(2, "0")}
										</span>
										<span
											className="size-2 shrink-0 rounded-full transition-transform group-hover:scale-125"
											style={{ background: color }}
										/>
										<span
											className="truncate text-xs font-medium"
											style={{ color: isTop ? "var(--foreground)" : "var(--muted-foreground)" }}
										>
											{item.name}
										</span>
									</div>
									<div className="flex shrink-0 items-center gap-2.5">
										<span
											className="text-[0.6rem] tabular-nums"
											style={{ color: "#547066" }}
										>
											{pct.toFixed(1)}%
										</span>
										<span
											className="financial-value text-xs font-semibold tabular-nums"
											style={{ color: isTop ? color : "var(--foreground)" }}
										>
											{formatBRL(item.value)}
										</span>
									</div>
								</div>

								{/* Progress track */}
								<div
									className="relative h-1 overflow-hidden rounded-full"
									style={{ background: "rgba(255,255,255,0.05)" }}
								>
									<motion.div
										className="absolute inset-y-0 left-0 rounded-full"
										style={{ background: color, opacity: isTop ? 1 : 0.65 }}
										initial={{ width: 0 }}
										animate={{ width: `${pct}%` }}
										transition={{
											duration: 0.7,
											delay: index * 0.06,
											ease: [0.25, 0.46, 0.45, 0.94],
										}}
									/>
								</div>
							</div>
						)
					})}
				</div>
			</CardContent>
		</Card>
	)
}
