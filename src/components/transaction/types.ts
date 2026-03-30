import type { getTransactions } from "@/actions/transaction"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "./schema"

export type Transaction = Awaited<ReturnType<typeof getTransactions>>[number]

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

export function getCategoryLabel(value: string, customCategory?: string | null) {
	if (value === "OTHER" && customCategory) return customCategory
	return ALL_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

export const COLUMN_LABELS: Record<string, string> = {
	date: "Data",
	type: "Tipo",
	category: "Categoria",
	description: "Descrição",
	amount: "Valor",
}
