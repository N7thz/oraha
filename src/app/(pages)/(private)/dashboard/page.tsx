import { CreateTransactionDialog } from "@/components/create-transaction-dialog"
import { ImportSpreadsheetButton } from "@/components/import-spreadsheet-button"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"
import { SummaryCards } from "@/components/dashboard/summary-cards"

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
				<div className="flex items-center gap-2">
					<CreateTransactionDialog />
					<ImportSpreadsheetButton />
				</div>
			</div>

			<SummaryCards />

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<MonthlyChart />
				</div>
				<CategoryChart />
			</div>
		</>
	)
}
