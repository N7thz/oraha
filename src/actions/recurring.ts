"use server"

import { recurringFormSchema } from "@/components/recurring/schema"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function getRecurringTransactions() {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session?.user) return []

	const rows = await prisma.recurringTransaction.findMany({
		where: { userId: session.user.id },
		orderBy: { createdAt: "desc" },
	})

	return rows.map((r) => ({ ...r, amount: Number(r.amount) }))
}

export async function createRecurringTransaction(data: unknown) {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session?.user) {
		return { success: false, error: "Não autorizado" } as const
	}

	const parsed = recurringFormSchema.safeParse(data)
	if (!parsed.success) {
		return { success: false, error: "Dados inválidos" } as const
	}

	const { type, category, customCategory, amount, description, dayOfMonth } =
		parsed.data

	await prisma.recurringTransaction.create({
		data: {
			userId: session.user.id,
			type,
			category,
			customCategory:
				category === "OTHER" ? (customCategory ?? null) : null,
			amount: parseFloat(amount.replace(",", ".")),
			description: description || null,
			dayOfMonth,
		},
	})

	return { success: true } as const
}

export async function toggleRecurringTransaction(id: string) {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session?.user) {
		return { success: false, error: "Não autorizado" } as const
	}

	const recurring = await prisma.recurringTransaction.findFirst({
		where: { id, userId: session.user.id },
	})

	if (!recurring) {
		return { success: false, error: "Não encontrado" } as const
	}

	await prisma.recurringTransaction.update({
		where: { id },
		data: { active: !recurring.active },
	})

	return { success: true } as const
}

export async function deleteRecurringTransaction(id: string) {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session?.user) {
		return { success: false, error: "Não autorizado" } as const
	}

	await prisma.recurringTransaction.deleteMany({
		where: { id, userId: session.user.id },
	})

	return { success: true } as const
}
