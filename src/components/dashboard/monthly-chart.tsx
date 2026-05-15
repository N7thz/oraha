"use client"

import { useQuery } from "@tanstack/react-query"
import {
	Bar,
	BarChart,
	CartesianGrid,
	ComposedChart,
	Line,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"

import { getMonthlyChartData } from "@/actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatBRL } from "@/lib/money"

const INCOME_COLOR = "#4bde7c"
const EXPENSE_COLOR = "#f87185"
const NET_COLOR = "#38bdf8"

function CustomTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean
	payload?: Array<{ name: string; value: number; color: string }>
	label?: string
}) {
	if (!active || !payload?.length) return null

	const income = payload.find((p) => p.name === "receitas")?.value ?? 0
	const expense = payload.find((p) => p.name === "despesas")?.value ?? 0
	const net = income - expense

	return (
		<div
			className="min-w-[160px] rounded-xl px-4 py-3 shadow-2xl"
			style={{
				background: "rgba(12,26,18,0.97)",
				border: "1px solid #1b2d22",
				backdropFilter: "blur(12px)",
			}}
		>
			<p
				className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.15em]"
				style={{ color: "#547066" }}
			>
				{label}
			</p>
			<div className="flex flex-col gap-1.5">
				<div className="flex items-center justify-between gap-6">
					<span className="flex items-center gap-1.5 text-xs" style={{ color: "#547066" }}>
						<span className="size-1.5 rounded-full" style={{ background: INCOME_COLOR }} />
						Receitas
					</span>
					<span className="financial-value text-xs font-semibold" style={{ color: INCOME_COLOR }}>
						{formatBRL(income)}
					</span>
				</div>
				<div className="flex items-center justify-between gap-6">
					<span className="flex items-center gap-1.5 text-xs" style={{ color: "#547066" }}>
						<span className="size-1.5 rounded-full" style={{ background: EXPENSE_COLOR }} />
						Despesas
					</span>
					<span className="financial-value text-xs font-semibold" style={{ color: EXPENSE_COLOR }}>
						{formatBRL(expense)}
					</span>
				</div>
				<div
					className="mt-1 flex items-center justify-between gap-6 border-t pt-1.5"
					style={{ borderColor: "#1b2d22" }}
				>
					<span className="text-xs" style={{ color: "#547066" }}>
						Saldo
					</span>
					<span
						className="financial-value text-xs font-bold"
						style={{ color: net >= 0 ? INCOME_COLOR : EXPENSE_COLOR }}
					>
						{net >= 0 ? "+" : ""}
						{formatBRL(net)}
					</span>
				</div>
			</div>
		</div>
	)
}

export function MonthlyChart() {
	const { data, isLoading } = useQuery({
		queryKey: ["monthly-chart"],
		queryFn: getMonthlyChartData,
	})

	if (isLoading) {
		return <Skeleton className="h-[300px] rounded-xl" />
	}

	const chartData = (data ?? []).map((d) => ({
		...d,
		saldo: d.receitas - d.despesas,
	}))

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
						Receitas vs Despesas
					</CardTitle>
					<div className="flex items-center gap-4">
						<span className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
							<span className="size-2 rounded-sm" style={{ background: INCOME_COLOR }} />
							Receitas
						</span>
						<span className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
							<span className="size-2 rounded-sm" style={{ background: EXPENSE_COLOR }} />
							Despesas
						</span>
						<span className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
							<span
								className="h-0.5 w-3 rounded-full"
								style={{ background: NET_COLOR }}
							/>
							Saldo
						</span>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={260}>
					<ComposedChart data={chartData} barGap={3} barCategoryGap="28%">
						<defs>
							<linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={INCOME_COLOR} stopOpacity={0.95} />
								<stop offset="100%" stopColor={INCOME_COLOR} stopOpacity={0.35} />
							</linearGradient>
							<linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity={0.95} />
								<stop offset="100%" stopColor={EXPENSE_COLOR} stopOpacity={0.35} />
							</linearGradient>
						</defs>

						<CartesianGrid
							strokeDasharray="2 6"
							stroke="rgba(255,255,255,0.04)"
							vertical={false}
						/>
						<XAxis
							dataKey="month"
							tick={{
								fontSize: 10,
								fill: "#547066",
								fontFamily: "var(--font-sans)",
							}}
							tickLine={false}
							axisLine={false}
							dy={4}
						/>
						<YAxis
							tickFormatter={(v) =>
								v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`
							}
							tick={{
								fontSize: 10,
								fill: "#547066",
								fontFamily: "var(--font-mono)",
							}}
							tickLine={false}
							axisLine={false}
							width={32}
						/>
						<Tooltip
							content={<CustomTooltip />}
							cursor={{ fill: "rgba(75,222,124,0.03)", rx: 6 }}
						/>

						<Bar
							dataKey="receitas"
							fill="url(#incomeGrad)"
							radius={[4, 4, 0, 0]}
							maxBarSize={32}
						/>
						<Bar
							dataKey="despesas"
							fill="url(#expenseGrad)"
							radius={[4, 4, 0, 0]}
							maxBarSize={32}
						/>
						<Line
							type="monotone"
							dataKey="saldo"
							stroke={NET_COLOR}
							strokeWidth={1.5}
							dot={{ fill: NET_COLOR, r: 3, strokeWidth: 0 }}
							activeDot={{ fill: NET_COLOR, r: 5, strokeWidth: 0 }}
							strokeDasharray="4 3"
						/>
					</ComposedChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
