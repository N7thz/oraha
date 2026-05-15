"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { headers } from "next/headers"

export async function getDashboardSummary() {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session?.user) {
		return { totalBalance: 0, monthlyIncome: 0, monthlyExpenses: 0 }
	}

	const userId = session.user.id
	const now = new Date()
	const from = startOfMonth(now)
	const to = endOfMonth(now)

	const [wallets, monthlyTransactions] = await Promise.all([
		prisma.wallet.findMany({ where: { userId } }),
		prisma.transaction.findMany({
			where: { userId, date: { gte: from, lte: to } },
			select: { type: true, amount: true },
		}),
	])

	const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)
	const monthlyIncome = monthlyTransactions
		.filter((t) => t.type === "INCOME")
		.reduce((sum, t) => sum + t.amount, 0)
	const monthlyExpenses = monthlyTransactions
		.filter((t) => t.type === "EXPENSE")
		.reduce((sum, t) => sum + t.amount, 0)

	return { totalBalance, monthlyIncome, monthlyExpenses }
}

export async function getMonthlyChartData() {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session?.user) return []

	const userId = session.user.id
	const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i))

	const results = await Promise.all(
		months.map(async (month) => {
			const from = startOfMonth(month)
			const to = endOfMonth(month)

			const transactions = await prisma.transaction.findMany({
				where: { userId, date: { gte: from, lte: to } },
				select: { type: true, amount: true },
			})

			const income = transactions
				.filter((t) => t.type === "INCOME")
				.reduce((s, t) => s + t.amount, 0)
			const expenses = transactions
				.filter((t) => t.type === "EXPENSE")
				.reduce((s, t) => s + t.amount, 0)

			return {
				month: format(month, "MMM/yy", { locale: ptBR }),
				receitas: income / 100,
				despesas: expenses / 100,
			}
		}),
	)

	return results
}

export async function getCategoryChartData() {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session?.user) return []

	const userId = session.user.id
	const now = new Date()
	const from = startOfMonth(now)
	const to = endOfMonth(now)

	const transactions = await prisma.transaction.findMany({
		where: { userId, type: "EXPENSE", date: { gte: from, lte: to } },
		select: { category: true, customCategory: true, amount: true },
	})

	const CATEGORY_LABELS: Record<string, string> = {
		FOOD: "Alimentação",
		TRANSPORT: "Transporte",
		HEALTH: "Saúde",
		EDUCATION: "Educação",
		ENTERTAINMENT: "Entretenimento",
		HOUSING: "Moradia",
		CLOTHING: "Vestuário",
		UTILITIES: "Contas",
		SALARY: "Salário",
		INVESTMENT: "Investimento",
		OTHER: "Outro",
	}

	const grouped: Record<string, number> = {}
	for (const t of transactions) {
		const label =
			t.category === "OTHER" && t.customCategory
				? t.customCategory
				: (CATEGORY_LABELS[t.category] ?? t.category)
		grouped[label] = (grouped[label] ?? 0) + t.amount
	}

	return Object.entries(grouped)
		.map(([name, value]) => ({ name, value: value / 100 }))
		.sort((a, b) => b.value - a.value)
		.slice(0, 8)
}
