import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImportSpreadsheetButton } from "@/components/import-spreadsheet-button"
import { TrendingUpIcon, TrendingDownIcon, WalletIcon } from "lucide-react"

const summaryCards = [
	{
		title: "Saldo Total",
		value: "R$ 0,00",
		icon: WalletIcon,
		description: "Soma de todas as contas",
	},
	{
		title: "Receitas",
		value: "R$ 0,00",
		icon: TrendingUpIcon,
		description: "Este mês",
	},
	{
		title: "Despesas",
		value: "R$ 0,00",
		icon: TrendingDownIcon,
		description: "Este mês",
	},
]

export default function DashboardPage() {
	return (
		<>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Dashboard</h1>
					<p className="text-sm text-muted-foreground">
						Visão geral das suas finanças
					</p>
				</div>
				<ImportSpreadsheetButton />
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{summaryCards.map((card) => (
					<Card key={card.title}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									{card.title}
								</CardTitle>
								<card.icon className="size-4 text-muted-foreground" />
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold">{card.value}</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{card.description}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</>
	)
}
