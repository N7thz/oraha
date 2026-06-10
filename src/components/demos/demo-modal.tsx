"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"
import {
	ArrowLeftRightIcon,
	FileSpreadsheetIcon,
	LayoutDashboardIcon,
	RepeatIcon,
	WalletIcon,
	XIcon,
} from "lucide-react"

import { DemoCanvas } from "./engine"
import { dashboardDemo } from "./scenarios/dashboard"
import { importDemo } from "./scenarios/import"
import { recurringDemo } from "./scenarios/recurring"
import { transactionDemo } from "./scenarios/transaction"
import { walletDemo } from "./scenarios/wallet"

export const DEMOS = [
	{
		id: "dashboard",
		icon: LayoutDashboardIcon,
		label: "Dashboard",
		description:
			"Cards de saldo total, receitas e despesas do mês — com gráficos de evolução histórica e categorias de gastos.",
		color: "#4bde7c",
		steps: dashboardDemo,
		demoLabel: "Cards de resumo · gráfico mensal · categorias",
	},
	{
		id: "transaction",
		icon: ArrowLeftRightIcon,
		label: "Transações",
		description:
			"Como registrar uma nova receita ou despesa: tipo, valor, categoria e data, com confirmação instantânea.",
		color: "#38bdf8",
		steps: transactionDemo,
		demoLabel: "Criar transação com tipo, valor, categoria e data",
	},
	{
		id: "wallet",
		icon: WalletIcon,
		label: "Carteiras",
		description:
			"Criação de carteiras financeiras (conta corrente, poupança, investimento) com saldo inicial configurável.",
		color: "#a78bfa",
		steps: walletDemo,
		demoLabel: "Adicionar nova carteira com saldo inicial",
	},
	{
		id: "recurring",
		icon: RepeatIcon,
		label: "Recorrentes",
		description:
			"Configuração de lançamentos mensais automáticos como aluguel, salário e assinaturas.",
		color: "#fb923c",
		steps: recurringDemo,
		demoLabel: "Criar transação recorrente com dia do mês",
	},
	{
		id: "import",
		icon: FileSpreadsheetIcon,
		label: "Importar Planilha",
		description:
			"Importação em lote de histórico financeiro a partir de arquivos .xlsx ou .csv com validação por linha.",
		color: "#facc15",
		steps: importDemo,
		demoLabel: "Pré-visualização e importação de dados em lote",
	},
] as const

type DemoModalProps = {
	initialIndex: number
	onClose: () => void
}

function ModalContent({ initialIndex, onClose }: DemoModalProps) {
	const [active, setActive] = useState(initialIndex)
	const demo = DEMOS[active]
	const Icon = demo.icon

	// Close on Escape
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose()
		}
		window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	}, [onClose])

	return (
		<AnimatePresence>
			<motion.div
				key="backdrop"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.2 }}
				className="fixed inset-0 z-[60] flex items-center justify-center p-4"
				style={{ background: "rgba(0,0,0,0.88)" }}
				onClick={(e) => {
					if (e.target === e.currentTarget) onClose()
				}}
			>
				<motion.div
					key="panel"
					initial={{ opacity: 0, scale: 0.96, y: 16 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.96, y: 16 }}
					transition={{ duration: 0.22, ease: "easeOut" }}
					className="flex w-full max-w-6xl flex-col gap-4 rounded-2xl p-5"
					style={{
						background: "var(--card)",
						border: "1px solid rgba(75,222,124,0.18)",
						boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
						maxHeight: "95vh",
						overflow: "hidden",
					}}
				>
					{/* Header */}
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-3">
							<div
								className="flex size-9 shrink-0 items-center justify-center rounded-xl"
								style={{ background: `${demo.color}18` }}
							>
								<Icon className="size-4" style={{ color: demo.color }} />
							</div>
							<div>
								<h2 className="text-base font-semibold leading-tight">
									{demo.label}
								</h2>
								<p
									className="text-xs leading-snug"
									style={{ color: "var(--muted-foreground)" }}
								>
									{demo.description}
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-muted/40"
							style={{ color: "var(--muted-foreground)" }}
						>
							<XIcon className="size-4" />
						</button>
					</div>

					{/* Tab nav */}
					<div className="flex flex-wrap gap-1.5">
						{DEMOS.map((d, i) => {
							const DIcon = d.icon
							const isActive = i === active
							return (
								<button
									key={d.id}
									type="button"
									onClick={() => setActive(i)}
									className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
									style={{
										background: isActive ? `${d.color}18` : "transparent",
										color: isActive
											? d.color
											: "var(--muted-foreground)",
										border: `1px solid ${isActive ? `${d.color}30` : "var(--border)"}`,
									}}
								>
									<DIcon className="size-3" />
									{d.label}
								</button>
							)
						})}
					</div>

					{/* Canvas — key forces remount on tab switch */}
					<div
						className="overflow-hidden rounded-xl"
						style={{ border: "1px solid rgba(75,222,124,0.1)" }}
					>
						<DemoCanvas
							key={demo.id}
							config={{ steps: demo.steps, label: demo.demoLabel }}
						/>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	)
}

export function DemoModal({ initialIndex, onClose }: DemoModalProps) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	return createPortal(
		<ModalContent initialIndex={initialIndex} onClose={onClose} />,
		document.body,
	)
}
