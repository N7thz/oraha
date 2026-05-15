"use server"

import { formSchema } from "@/components/transaction/schema"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export type ImportRow = {
	date: string
	type: "INCOME" | "EXPENSE"
	category: string
	customCategory?: string
	amount: number
	description?: string
}

export async function getTransactions() {
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session?.user) return []

	return prisma.transaction.findMany({
		where: { userId: session.user.id },
		orderBy: [{ date: "desc" }, { id: "desc" }],
	})
}

export async function createTransaction(data: unknown) {

	const session = await auth.api.getSession({ headers: await headers() })

	if (!session?.user) {
		return { success: false, error: "Não autorizado" } as const
	}

	const parsed = formSchema.safeParse(data)

	if (!parsed.success) {
		return { success: false, error: "Dados inválidos" } as const
	}

	const {
		type,
		category,
		customCategory,
		amount,
		description,
		date
	} = parsed.data

	const userId = session.user.id

	await prisma.transaction.create({
		data: {
			userId,
			type,
			category,
			customCategory: category === "OTHER" ? (customCategory ?? null) : null,
			amount: Math.round(parseFloat(amount.replace(",", ".")) * 100),
			description: description || null,
			date: new Date(`${date}T12:00:00`),
		},
	})

	return { success: true } as const
}

export async function importTransactions(rows: ImportRow[]) {
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session?.user) {
		return { success: false, error: "Não autorizado", count: 0 } as const
	}

	if (!rows.length) {
		return { success: false, error: "Nenhuma linha válida", count: 0 } as const
	}

	const userId = session.user.id

	await prisma.transaction.createMany({
		data: rows.map((r) => ({
			userId,
			type: r.type,
			category: r.category as never,
			customCategory: r.customCategory ?? null,
			amount: Math.round(r.amount * 100),
			description: r.description ?? null,
			date: new Date(`${r.date}T12:00:00`),
		})),
	})

	return { success: true, count: rows.length } as const
}
