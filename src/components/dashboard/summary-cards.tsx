"use client"

import { useQuery } from "@tanstack/react-query"
import { TrendingDownIcon, TrendingUpIcon, WalletIcon } from "lucide-react"
import { motion } from "motion/react"

import { getDashboardSummary } from "@/actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatBRL } from "@/lib/money"

const INCOME_COLOR = "#4bde7c"
const EXPENSE_COLOR = "#f87185"
const NEUTRAL_COLOR = "hsl(var(--foreground))"

export function SummaryCards() {
	const { data, isLoading } = useQuery({
		queryKey: ["dashboard-summary"],
		queryFn: getDashboardSummary,
	})

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="h-32 rounded-xl" />
				))}
			</div>
		)
	}

	const totalBalance = (data?.totalBalance ?? 0) / 100
	const monthlyIncome = (data?.monthlyIncome ?? 0) / 100
	const monthlyExpenses = (data?.monthlyExpenses ?? 0) / 100

	const cards = [
		{
			title: "Saldo total",
			value: formatBRL(totalBalance),
			color: NEUTRAL_COLOR,
			icon: WalletIcon,
			iconBg: "rgba(75, 222, 124, 0.1)",
			iconColor: INCOME_COLOR,
			description: "Soma de todas as contas",
		},
		{
			title: "Receitas",
			value: formatBRL(monthlyIncome),
			color: INCOME_COLOR,
			icon: TrendingUpIcon,
			iconBg: "rgba(75, 222, 124, 0.1)",
			iconColor: INCOME_COLOR,
			description: "Este mês",
		},
		{
			title: "Despesas",
			value: formatBRL(monthlyExpenses),
			color: EXPENSE_COLOR,
			icon: TrendingDownIcon,
			iconBg: "rgba(248, 113, 133, 0.1)",
			iconColor: EXPENSE_COLOR,
			description: "Este mês",
		},
	]

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-3" data-tour="summary-cards">
			{cards.map((card, i) => (
				<motion.div
					key={card.title}
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35, delay: i * 0.08, ease: "easeOut" }}
				>
					<Card className="group h-full transition-shadow hover:shadow-lg dark:hover:shadow-[0_4px_24px_rgba(75,222,124,0.06)]">
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
									{card.title}
								</CardTitle>
								<div
									className="flex size-8 items-center justify-center rounded-lg"
									style={{ background: card.iconBg }}
								>
									<card.icon
										className="size-4"
										style={{ color: card.iconColor }}
									/>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<p
								className="financial-value text-3xl font-bold tabular-nums"
								style={{ color: card.color }}
							>
								{card.value}
							</p>
							<p className="mt-2 text-xs text-muted-foreground">
								{card.description}
							</p>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	)
}
