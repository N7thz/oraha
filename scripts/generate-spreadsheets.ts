import * as XLSX from "xlsx"
import { join } from "path"

// Planilha 1 — Gastos pessoais (março 2025)
const gassosPessoais = [
	["Data", "Descrição", "Categoria", "Valor (R$)", "Tipo"],
	["01/03/2025", "Supermercado Extra", "Alimentação", -450.80, "Débito"],
	["02/03/2025", "Salário", "Receita", 5200.00, "Crédito"],
	["03/03/2025", "Netflix", "Entretenimento", -55.90, "Débito"],
	["05/03/2025", "Farmácia Nissei", "Saúde", -89.40, "Débito"],
	["07/03/2025", "Uber", "Transporte", -32.50, "Débito"],
	["08/03/2025", "Restaurante Madero", "Alimentação", -124.00, "Débito"],
	["10/03/2025", "Conta de luz", "Moradia", -210.00, "Débito"],
	["10/03/2025", "Internet Vivo", "Moradia", -99.90, "Débito"],
	["12/03/2025", "Academia Smart Fit", "Saúde", -79.90, "Débito"],
	["14/03/2025", "iFood", "Alimentação", -67.30, "Débito"],
	["15/03/2025", "Freelance design", "Receita", 800.00, "Crédito"],
	["17/03/2025", "Posto Shell", "Transporte", -180.00, "Débito"],
	["19/03/2025", "Spotify", "Entretenimento", -21.90, "Débito"],
	["20/03/2025", "Aluguel", "Moradia", -1400.00, "Débito"],
	["22/03/2025", "Mercado Livre", "Compras", -312.00, "Débito"],
	["24/03/2025", "Consulta médica", "Saúde", -250.00, "Débito"],
	["25/03/2025", "Bar do Zé", "Entretenimento", -85.00, "Débito"],
	["27/03/2025", "Livraria Saraiva", "Educação", -140.00, "Débito"],
	["28/03/2025", "Padaria", "Alimentação", -38.50, "Débito"],
	["30/03/2025", "Transferência recebida", "Receita", 300.00, "Crédito"],
]

// Planilha 2 — Gastos empresa (março 2025)
const gastosEmpresa = [
	["Data", "Descrição", "Categoria", "Valor (R$)", "Tipo", "Centro de Custo"],
	["01/03/2025", "Google Workspace", "Software", -89.90, "Débito", "TI"],
	["01/03/2025", "AWS EC2", "Infraestrutura", -340.00, "Débito", "TI"],
	["03/03/2025", "Receita cliente A", "Receita", 8500.00, "Crédito", "Comercial"],
	["05/03/2025", "Figma", "Software", -75.00, "Débito", "Design"],
	["06/03/2025", "Receita cliente B", "Receita", 4200.00, "Crédito", "Comercial"],
	["08/03/2025", "Material de escritório", "Operacional", -156.00, "Débito", "Admin"],
	["10/03/2025", "Folha de pagamento", "RH", -12400.00, "Débito", "RH"],
	["12/03/2025", "Aluguel sala", "Infraestrutura", -2800.00, "Débito", "Admin"],
	["14/03/2025", "GitHub Teams", "Software", -42.00, "Débito", "TI"],
	["15/03/2025", "Receita cliente C", "Receita", 6300.00, "Crédito", "Comercial"],
	["17/03/2025", "Treinamento equipe", "Educação", -900.00, "Débito", "RH"],
	["18/03/2025", "Conta de energia", "Infraestrutura", -420.00, "Débito", "Admin"],
	["20/03/2025", "Campanha Google Ads", "Marketing", -1200.00, "Débito", "Marketing"],
	["22/03/2025", "Receita cliente D", "Receita", 3100.00, "Crédito", "Comercial"],
	["24/03/2025", "Notion Teams", "Software", -32.00, "Débito", "TI"],
	["25/03/2025", "Contabilidade", "Operacional", -750.00, "Débito", "Admin"],
	["27/03/2025", "Viagem a negócios", "Operacional", -1850.00, "Débito", "Comercial"],
	["28/03/2025", "Slack", "Software", -68.00, "Débito", "TI"],
	["29/03/2025", "Receita cliente E", "Receita", 5700.00, "Crédito", "Comercial"],
	["31/03/2025", "Impostos", "Fiscal", -2100.00, "Débito", "Admin"],
]

function createSheet(data: (string | number)[][]) {
	const ws = XLSX.utils.aoa_to_sheet(data)

	// Ajusta largura das colunas
	const cols = data[0].map((_, i) => ({
		wch: Math.max(...data.map((row) => String(row[i] ?? "").length)) + 2,
	}))
	ws["!cols"] = cols

	return ws
}

const wb1 = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb1, createSheet(gassosPessoais), "Março 2025")
XLSX.writeFile(wb1, join(import.meta.dir, "../gastos-pessoais-mar2025.xlsx"))

const wb2 = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb2, createSheet(gastosEmpresa), "Março 2025")
XLSX.writeFile(wb2, join(import.meta.dir, "../gastos-empresa-mar2025.xlsx"))

console.log("✓ gastos-pessoais-mar2025.xlsx")
console.log("✓ gastos-empresa-mar2025.xlsx")
