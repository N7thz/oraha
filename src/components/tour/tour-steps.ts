export type TourStep = {
	id: string
	target: string | null
	title: string
	description: string
	placement: "top" | "bottom" | "left" | "right" | "center"
}

export const TOUR_STEPS: TourStep[] = [
	{
		id: "welcome",
		target: null,
		title: "Bem-vindo ao Oraha!",
		description:
			"Vamos conhecer juntos as principais funcionalidades do seu assistente de gestão financeira pessoal. O tour leva menos de 1 minuto.",
		placement: "center",
	},
	{
		id: "summary-cards",
		target: "summary-cards",
		title: "Resumo Financeiro",
		description:
			"Estes três cards mostram seu saldo total (soma de todas as carteiras), e as receitas e despesas acumuladas no mês atual. Os valores atualizam automaticamente.",
		placement: "bottom",
	},
	{
		id: "monthly-chart",
		target: "monthly-chart",
		title: "Gráfico Mensal",
		description:
			"Visualize a evolução de receitas (verde) e despesas (rosa) nos últimos 6 meses. A linha tracejada azul representa o saldo líquido de cada mês.",
		placement: "top",
	},
	{
		id: "category-chart",
		target: "category-chart",
		title: "Categorias de Gastos",
		description:
			"Descubra em quais categorias você gastou mais neste mês. Cada barra representa a proporção daquela categoria no total de despesas.",
		placement: "left",
	},
	{
		id: "create-transaction",
		target: "create-transaction",
		title: "Nova Transação",
		description:
			"Clique aqui para registrar uma nova receita ou despesa. Você pode definir o valor, categoria, data e carteira de origem.",
		placement: "bottom",
	},
	{
		id: "nav-transactions",
		target: "nav-transactions",
		title: "Transações",
		description:
			"Acesse o histórico completo de movimentações com filtros por tipo, categoria e período. Você também pode ordenar e pesquisar transações.",
		placement: "right",
	},
	{
		id: "nav-wallets",
		target: "nav-wallets",
		title: "Carteiras",
		description:
			"Gerencie suas contas bancárias, cartões de crédito, investimentos e outros recursos financeiros. Cada carteira rastreia seu próprio saldo.",
		placement: "right",
	},
	{
		id: "nav-recurring",
		target: "nav-recurring",
		title: "Transações Recorrentes",
		description:
			"Configure pagamentos mensais fixos como aluguel, salário e assinaturas. Cadastre uma vez e acompanhe seus compromissos mensais.",
		placement: "right",
	},
	{
		id: "nav-help",
		target: "nav-help",
		title: "Central de Ajuda",
		description:
			"Tem dúvidas? Consulte a central de ajuda com guias completos e perguntas frequentes sobre todas as funcionalidades do Oraha.",
		placement: "right",
	},
	{
		id: "complete",
		target: null,
		title: "Você está pronto!",
		description:
			"Agora você conhece as principais funcionalidades do Oraha. Comece criando suas carteiras e registrando sua primeira transação. Boa gestão financeira!",
		placement: "center",
	},
]
