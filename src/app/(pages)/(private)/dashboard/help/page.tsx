"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
	ArrowLeftRightIcon,
	BookOpenIcon,
	ChevronDownIcon,
	FileSpreadsheetIcon,
	HelpCircleIcon,
	LayoutDashboardIcon,
	PlayIcon,
	RepeatIcon,
	SearchIcon,
	SettingsIcon,
	ShieldCheckIcon,
	WalletIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { DemoSection } from "@/components/demos"
import { useTour } from "@/components/tour"

// ─── Types ────────────────────────────────────────────────────────────────────

type FaqItem = { q: string; a: string }

type Section = {
	id: string
	icon: React.ElementType
	title: string
	color: string
	items: FaqItem[]
}

// ─── Content ──────────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
	{
		id: "dashboard",
		icon: LayoutDashboardIcon,
		title: "Dashboard",
		color: "#4bde7c",
		items: [
			{
				q: "O que é o Saldo Total?",
				a: "É a soma do saldo de todas as suas carteiras cadastradas (conta corrente, poupança, dinheiro, investimento etc.). Ele reflete o patrimônio líquido atual registrado no Oraha.",
			},
			{
				q: "Como são calculadas as Receitas e Despesas do mês?",
				a: "São somadas todas as transações do mês corrente marcadas como Receita ou Despesa, respectivamente. O mês muda automaticamente na virada de cada mês.",
			},
			{
				q: "O que mostra o gráfico de barras?",
				a: "Mostra a comparação entre receitas e despesas nos últimos 6 meses. A linha tracejada azul representa o saldo líquido de cada mês (receitas − despesas). Passe o mouse sobre as barras para ver os valores detalhados.",
			},
			{
				q: "O que mostra o gráfico de categorias?",
				a: "Exibe as despesas do mês atual agrupadas por categoria. Cada barra horizontal representa a proporção daquela categoria no total de gastos. A categoria com maior gasto aparece em destaque.",
			},
			{
				q: "Os dados do dashboard são em tempo real?",
				a: "Sim. Os cards e gráficos buscam os dados mais recentes ao carregar a página. Após criar ou importar transações, os dados são atualizados automaticamente.",
			},
		],
	},
	{
		id: "transactions",
		icon: ArrowLeftRightIcon,
		title: "Transações",
		color: "#38bdf8",
		items: [
			{
				q: "Como criar uma nova transação?",
				a: 'Clique no botão "Nova transação" no canto superior direito do Dashboard ou da página de Transações. Preencha o tipo (receita ou despesa), valor, categoria e data. O campo descrição é opcional.',
			},
			{
				q: "Quais são as categorias disponíveis?",
				a: "Para despesas: Alimentação, Transporte, Saúde, Educação, Entretenimento, Moradia, Vestuário, Contas/Utilidades e Outro. Para receitas: Salário, Investimento e Outro. Ao selecionar Outro, você pode digitar uma categoria personalizada.",
			},
			{
				q: "Como filtrar transações?",
				a: "Na página de Transações, use a barra de ferramentas acima da tabela para filtrar por: tipo (receita/despesa), categoria e intervalo de datas. É possível combinar múltiplos filtros ao mesmo tempo.",
			},
			{
				q: "Como pesquisar uma transação específica?",
				a: "Use o campo de busca na toolbar para pesquisar por descrição ou categoria. A busca é feita em tempo real enquanto você digita.",
			},
			{
				q: "Posso vincular uma transação a uma carteira?",
				a: "Sim, ao criar a transação é possível selecionar a carteira de origem/destino. Isso ajuda a organizar melhor de qual conta saiu ou entrou cada valor.",
			},
			{
				q: "Como ordenar a tabela de transações?",
				a: "Clique no cabeçalho de qualquer coluna (Data, Valor, Categoria) para ordenar por aquele campo. Clique novamente para inverter a ordem.",
			},
		],
	},
	{
		id: "wallets",
		icon: WalletIcon,
		title: "Carteiras",
		color: "#a78bfa",
		items: [
			{
				q: "O que é uma carteira no Oraha?",
				a: "Uma carteira representa qualquer conta ou reserva financeira sua: conta corrente, poupança, cartão de crédito, dinheiro em espécie, investimento ou conta Pix. Você pode ter quantas carteiras quiser.",
			},
			{
				q: "Quais tipos de carteira estão disponíveis?",
				a: "Conta Corrente, Poupança, Cartão de Crédito, Dinheiro, Investimento e Pix. Cada tipo tem um ícone próprio para facilitar a identificação visual.",
			},
			{
				q: "Como criar uma carteira?",
				a: 'Na página Carteiras, clique em "Nova carteira". Informe o nome (ex: "Nubank"), escolha o tipo e o saldo inicial. O saldo inicial representa quanto você já tem nessa conta no momento do cadastro.',
			},
			{
				q: "O saldo da carteira é atualizado automaticamente?",
				a: "O saldo exibido nos cards é o saldo cadastrado manualmente. Para manter atualizado, vincule suas transações à carteira correspondente e ajuste o saldo quando necessário.",
			},
			{
				q: "Posso excluir uma carteira?",
				a: "Funcionalidade de exclusão está prevista em próximas versões. Por enquanto, carteiras sem movimento podem ser mantidas sem impacto nos relatórios.",
			},
		],
	},
	{
		id: "recurring",
		icon: RepeatIcon,
		title: "Transações Recorrentes",
		color: "#fb923c",
		items: [
			{
				q: "O que é uma transação recorrente?",
				a: "É um lançamento que acontece todo mês no mesmo dia, como aluguel, salário, assinaturas ou plano de saúde. Você cadastra uma vez e ela fica registrada como padrão mensal.",
			},
			{
				q: "Como criar uma recorrente?",
				a: 'Na página Recorrentes, clique em "Nova recorrente". Preencha o tipo, valor, categoria, descrição e o dia do mês em que o lançamento ocorre (ex: dia 5 para salário, dia 10 para aluguel).',
			},
			{
				q: "Como pausar uma recorrente temporariamente?",
				a: 'Na listagem de recorrentes, clique no ícone de pausa (⏸) ao lado do item. A transação ficará marcada como "Pausada" e não será considerada em relatórios futuros até ser reativada.',
			},
			{
				q: "Como reativar uma recorrente pausada?",
				a: "Clique no ícone de play (▶) ao lado da recorrente pausada. Ela voltará ao status ativo imediatamente.",
			},
			{
				q: "Como excluir uma recorrente?",
				a: "Clique no ícone de lixeira (🗑) ao lado do item na listagem. A exclusão é permanente e não afeta transações já lançadas anteriormente.",
			},
			{
				q: "As recorrentes geram transações automaticamente?",
				a: "No momento, as recorrentes servem como registro de padrões mensais. A geração automática de transações no dia configurado está prevista para uma próxima versão.",
			},
		],
	},
	{
		id: "import",
		icon: FileSpreadsheetIcon,
		title: "Importar Planilha",
		color: "#facc15",
		items: [
			{
				q: "Quais formatos de arquivo são aceitos?",
				a: "São aceitos arquivos .xlsx (Excel) e .csv. O arquivo deve ter as colunas na primeira linha, conforme o modelo disponível para download.",
			},
			{
				q: "Quais colunas a planilha precisa ter?",
				a: "A planilha deve conter obrigatoriamente: data (dd/mm/aaaa ou aaaa-mm-dd), tipo (receita ou despesa), categoria e valor (decimal). A coluna descricao é opcional.",
			},
			{
				q: "Quais são os valores aceitos para categoria?",
				a: "alimentacao, transporte, saude, educacao, entretenimento, moradia, vestuario, contas, salario, investimento, outro. Variações com acentos também são aceitas (ex: alimentação, saúde).",
			},
			{
				q: "Como baixar o modelo de planilha?",
				a: 'Clique em "Importar planilha" e depois em "Baixar modelo .xlsx". O arquivo já vem preenchido com exemplos das categorias e formato correto de datas.',
			},
			{
				q: "O que acontece se uma linha tiver erro?",
				a: 'Antes de confirmar a importação, o Oraha exibe uma pré-visualização com as linhas válidas e as inválidas (com o motivo do erro, ex: "data inválida"). Somente as linhas válidas são importadas.',
			},
			{
				q: "Posso importar múltiplos meses de uma vez?",
				a: "Sim. Uma única planilha pode conter transações de qualquer período. Basta que cada linha tenha a data correta e as demais colunas preenchidas.",
			},
		],
	},
	{
		id: "settings",
		icon: SettingsIcon,
		title: "Configurações",
		color: "#f472b6",
		items: [
			{
				q: "Como alterar meu nome de exibição?",
				a: 'Em Configurações > Perfil, edite o campo Nome e clique em "Salvar alterações".',
			},
			{
				q: "Como trocar minha senha?",
				a: 'Em Configurações > Alterar senha, preencha a senha atual e a nova senha (mínimo 8 caracteres). Clique em "Alterar senha" para confirmar.',
			},
			{
				q: "O que é a autenticação em dois fatores (2FA)?",
				a: "É uma camada extra de segurança que exige um código temporário de 6 dígitos (gerado por um aplicativo como Google Authenticator ou Authy) além da senha ao fazer login.",
			},
			{
				q: "Como ativar o 2FA?",
				a: 'Em Configurações > Autenticação em dois fatores, clique em "Ativar 2FA". Um QR Code será exibido — escaneie com seu aplicativo autenticador e insira o código gerado para confirmar a ativação.',
			},
			{
				q: "Como desativar o 2FA?",
				a: 'Em Configurações, clique em "Desativar 2FA". Confirme sua senha e o código atual do aplicativo autenticador para remover a proteção.',
			},
			{
				q: "Como alternar entre modo claro e escuro?",
				a: "Clique no ícone de tema (sol/lua) no cabeçalho do dashboard ou na sidebar. A preferência é salva no navegador.",
			},
		],
	},
	{
		id: "faq",
		icon: HelpCircleIcon,
		title: "Perguntas Frequentes",
		color: "#34d399",
		items: [
			{
				q: "Meus dados estão seguros?",
				a: "Sim. Todos os dados são armazenados em banco de dados PostgreSQL hospedado na Supabase com conexão criptografada. Senhas são armazenadas com hash usando scrypt.",
			},
			{
				q: "Posso usar o Oraha em dispositivos móveis?",
				a: "Sim, o Oraha é responsivo e funciona em smartphones e tablets pelo navegador. Uma versão mobile nativa está prevista para versões futuras.",
			},
			{
				q: "O que são parcelamentos?",
				a: "Parcelamentos agrupam uma compra dividida em várias prestações mensais (ex: notebook em 6x de R$ 400). Cada parcela aparece na listagem de transações com o indicador de parcela (ex: 3/6).",
			},
			{
				q: "Como o Oraha lida com centavos?",
				a: "Todos os valores são armazenados em centavos (inteiros) para evitar erros de ponto flutuante. A exibição usa a biblioteca Dinero.js para formatação precisa em BRL.",
			},
			{
				q: "Posso ter mais de uma conta de usuário?",
				a: "Sim. Cada usuário tem seus próprios dados isolados. O cadastro é feito com e-mail e senha através da tela de login.",
			},
			{
				q: "Como reportar um problema ou sugerir melhorias?",
				a: "Entre em contato pelo e-mail de suporte ou abra uma issue no repositório do projeto. Toda sugestão é bem-vinda para evoluir o Oraha.",
			},
		],
	},
]

// ─── Accordion item ────────────────────────────────────────────────────────────

function AccordionItem({
	item,
	color,
	isOpen,
	onToggle,
}: {
	item: FaqItem
	color: string
	isOpen: boolean
	onToggle: () => void
}) {
	return (
		<div
			className="overflow-hidden rounded-lg border transition-colors"
			style={{
				borderColor: isOpen ? `${color}30` : "var(--border)",
				background: isOpen ? `${color}06` : "transparent",
			}}
		>
			<button
				onClick={onToggle}
				className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
			>
				<span className="text-sm font-medium leading-snug">{item.q}</span>
				<ChevronDownIcon
					className="size-4 shrink-0 text-muted-foreground transition-transform duration-200"
					style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
				/>
			</button>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.22, ease: "easeInOut" }}
					>
						<div
							className="border-t px-4 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground"
							style={{ borderColor: `${color}20` }}
						>
							{item.a}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

// ─── Section ──────────────────────────────────────────────────────────────────

function HelpSection({
	section,
	query,
}: {
	section: Section
	query: string
}) {
	const [openIndex, setOpenIndex] = useState<number | null>(null)
	const Icon = section.icon

	const filteredItems = useMemo(() => {
		if (!query) return section.items
		const q = query.toLowerCase()
		return section.items.filter(
			(item) =>
				item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
		)
	}, [section.items, query])

	if (!filteredItems.length) return null

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2.5">
				<div
					className="flex size-7 items-center justify-center rounded-lg"
					style={{ background: `${section.color}18` }}
				>
					<Icon className="size-3.5" style={{ color: section.color }} />
				</div>
				<h2 className="text-sm font-semibold">{section.title}</h2>
				<span
					className="rounded-full px-1.5 py-0.5 text-[0.6rem] font-medium tabular-nums"
					style={{
						background: `${section.color}18`,
						color: section.color,
					}}
				>
					{filteredItems.length}
				</span>
			</div>

			<div className="flex flex-col gap-1.5">
				{filteredItems.map((item, i) => (
					<AccordionItem
						key={i}
						item={item}
						color={section.color}
						isOpen={openIndex === i}
						onToggle={() => setOpenIndex(openIndex === i ? null : i)}
					/>
				))}
			</div>
		</div>
	)
}

// ─── Quick start cards ────────────────────────────────────────────────────────

const QUICK_START = [
	{
		step: "01",
		title: "Crie suas carteiras",
		description:
			"Adicione suas contas bancárias, cartões e carteira de dinheiro com o saldo atual de cada uma.",
		icon: WalletIcon,
		color: "#a78bfa",
		href: "/dashboard/wallets",
	},
	{
		step: "02",
		title: "Registre transações",
		description:
			'Use "Nova transação" para lançar receitas e despesas, ou importe uma planilha com seu histórico.',
		icon: ArrowLeftRightIcon,
		color: "#38bdf8",
		href: "/dashboard/transactions",
	},
	{
		step: "03",
		title: "Configure recorrentes",
		description:
			"Cadastre contas fixas e salário como recorrentes para ter um panorama completo dos seus compromissos mensais.",
		icon: RepeatIcon,
		color: "#fb923c",
		href: "/dashboard/recurring",
	},
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HelpPage() {
	const [query, setQuery] = useState("")
	const { start } = useTour()
	const router = useRouter()

	const handleStartTour = useCallback(() => {
		start()
		router.push("/dashboard")
	}, [start, router])

	const totalResults = useMemo(() => {
		if (!query) return null
		const q = query.toLowerCase()
		return SECTIONS.reduce(
			(acc, s) =>
				acc +
				s.items.filter(
					(item) =>
						item.q.toLowerCase().includes(q) ||
						item.a.toLowerCase().includes(q),
				).length,
			0,
		)
	}, [query])

	return (
		<>
			{/* Header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-xl font-semibold">Ajuda</h1>
					<p className="text-sm text-muted-foreground">
						Guias, fluxos e perguntas frequentes
					</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={handleStartTour}
						className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-opacity hover:opacity-80"
						style={{
							background: "rgba(75,222,124,0.12)",
							color: "#4bde7c",
							border: "1px solid rgba(75,222,124,0.2)",
						}}
					>
						<PlayIcon className="size-3" />
						Reiniciar tour
					</button>
					<div
						className="flex size-10 items-center justify-center rounded-xl"
						style={{ background: "rgba(75,222,124,0.1)" }}
					>
						<BookOpenIcon className="size-5" style={{ color: "#4bde7c" }} />
					</div>
				</div>
			</div>

			{/* Interactive Demos */}
			{!query && (
				<div>
					<p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
						Demonstrações interativas
					</p>
					<div
						className="rounded-xl p-4"
						style={{
							background: "var(--card)",
							border: "1px solid var(--border)",
						}}
					>
						<DemoSection />
					</div>
				</div>
			)}

			{/* Search */}
			<div className="relative">
				<SearchIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					placeholder="Buscar por dúvida ou tópico..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="h-10 w-full rounded-xl pl-10 pr-4 text-sm outline-none transition-all focus:ring-1 focus:ring-primary/50"
					style={{
						background: "var(--card)",
						border: "1px solid var(--border)",
						color: "var(--foreground)",
					}}
				/>
				{query && (
					<div className="absolute right-3.5 top-1/2 -translate-y-1/2">
						<span
							className="text-[0.65rem] font-medium tabular-nums"
							style={{ color: "#547066" }}
						>
							{totalResults} resultado{totalResults !== 1 ? "s" : ""}
						</span>
					</div>
				)}
			</div>

			{/* Quick start — only when not searching */}
			{!query && (
				<div>
					<p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
						Início rápido
					</p>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						{QUICK_START.map((step) => {
							const Icon = step.icon
							return (
								<a
									key={step.step}
									href={step.href}
									className="group flex flex-col gap-3 rounded-xl p-4 transition-all hover:scale-[1.01]"
									style={{
										background: "var(--card)",
										border: "1px solid var(--border)",
									}}
								>
									<div className="flex items-center justify-between">
										<span
											className="font-display italic text-2xl leading-none"
											style={{ color: `${step.color}50` }}
										>
											{step.step}
										</span>
										<div
											className="flex size-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
											style={{ background: `${step.color}18` }}
										>
											<Icon className="size-4" style={{ color: step.color }} />
										</div>
									</div>
									<div>
										<p className="mb-1 text-sm font-semibold">{step.title}</p>
										<p className="text-xs leading-relaxed text-muted-foreground">
											{step.description}
										</p>
									</div>
								</a>
							)
						})}
					</div>
				</div>
			)}

			{/* Sections */}
			<div className="flex flex-col gap-8">
				{SECTIONS.map((section) => (
					<HelpSection key={section.id} section={section} query={query} />
				))}
			</div>

			{/* Footer note */}
			<div
				className="flex items-center gap-3 rounded-xl p-4"
				style={{
					background: "rgba(75,222,124,0.04)",
					border: "1px solid rgba(75,222,124,0.12)",
				}}
			>
				<ShieldCheckIcon className="size-4 shrink-0" style={{ color: "#4bde7c" }} />
				<p className="text-xs leading-relaxed text-muted-foreground">
					Não encontrou o que procurava? Entre em contato pelo e-mail{" "}
					<span className="font-medium text-foreground">suporte@oraha.app</span>
				</p>
			</div>
		</>
	)
}
