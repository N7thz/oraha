"use server"

import { walletFormSchema } from "@/components/wallet/schema"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function createWallet(data: unknown) {
	
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session?.user) {
		return { success: false, error: "Não autorizado" } as const
	}

	const parsed = walletFormSchema.safeParse(data)

	if (!parsed.success) {
		return { success: false, error: "Dados inválidos" } as const
	}

	const { name, type, balance } = parsed.data

	await prisma.wallet.create({
		data: {
			userId: session.user.id,
			name,
			type,
			balance: balance ? Math.round(parseFloat(balance.replace(",", ".")) * 100) : 0,
		},
	})

	return { success: true } as const
}

export async function getWallets() {
	
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session?.user) {
		return []
	}

	return prisma.wallet.findMany({
		where: { userId: session.user.id },
		orderBy: { createdAt: "asc" },
	})
}
