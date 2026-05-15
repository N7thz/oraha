import { CreateRecurringDialog } from "@/components/recurring/create-recurring-dialog"
import { RecurringList } from "@/components/recurring/recurring-list"

export default function RecurringPage() {
	return (
		<>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Recorrentes</h1>
					<p className="text-sm text-muted-foreground">
						Transações lançadas automaticamente todo mês
					</p>
				</div>
				<CreateRecurringDialog />
			</div>
			<RecurringList />
		</>
	)
}
