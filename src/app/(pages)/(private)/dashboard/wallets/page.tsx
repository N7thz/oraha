import { CreateWalletDialog } from "@/components/wallet/create-wallet-dialog"
import { WalletList } from "@/components/wallet/wallet-list"

export default function WalletsPage() {
	return (
		<>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Carteiras</h1>
					<p className="text-sm text-muted-foreground">
						Gerencie suas contas e carteiras
					</p>
				</div>
				<CreateWalletDialog />
			</div>
			<WalletList />
		</>
	)
}
