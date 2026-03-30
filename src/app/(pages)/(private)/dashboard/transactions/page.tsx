import { CreateTransactionDialog } from "@/components/create-transaction-dialog"
import { TransactionList } from "@/components/transaction/transaction-list"

export default function TransactionsPage() {
	return (
		<>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Transações</h1>
					<p className="text-sm text-muted-foreground">
						Histórico de todas as suas movimentações
					</p>
				</div>
				<CreateTransactionDialog />
			</div>
			<TransactionList />
		</>
	)
}
