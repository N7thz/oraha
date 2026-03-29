"use client"

import { useQuery } from "@tanstack/react-query"
import {
	BanknoteIcon,
	CreditCardIcon,
	LucideIcon,
	PiggyBankIcon,
	TrendingUpIcon,
	WalletIcon,
	ZapIcon
} from "lucide-react"

import { getWallets } from "@/actions/wallet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatBRL } from "@/lib/money"
import type { WalletType } from "@prisma/enums"

const WALLET_TYPE_CONFIG: Record<WalletType, { label: string; icon: LucideIcon }> = {
	CHECKING: { label: "Conta Corrente", icon: BanknoteIcon },
	SAVINGS: { label: "Poupança", icon: PiggyBankIcon },
	CREDIT_CARD: { label: "Cartão de Crédito", icon: CreditCardIcon },
	CASH: { label: "Dinheiro", icon: WalletIcon },
	INVESTMENT: { label: "Investimento", icon: TrendingUpIcon },
	PIX: { label: "Pix", icon: ZapIcon },
}

export function WalletList() {

	const { data: wallets, isLoading } = useQuery({
		queryKey: ["wallets"],
		queryFn: () => getWallets(),
	})

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="h-28 rounded-xl" />
				))}
			</div>
		)
	}

	if (!wallets?.length) {
		return (
			<p className="text-sm text-muted-foreground">
				Nenhuma carteira cadastrada. Crie sua primeira carteira.
			</p>
		)
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{wallets.map((wallet) => {

				const config = WALLET_TYPE_CONFIG[wallet.type]

				const Icon = config.icon

				return (
					<Card key={wallet.id}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									{wallet.name}
								</CardTitle>
								<Icon className="size-4 text-muted-foreground" />
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold">
								{formatBRL(wallet.balance / 100)}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">{config.label}</p>
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}
