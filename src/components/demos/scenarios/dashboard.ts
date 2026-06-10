import type { AnimStep } from "../engine"
import {
	C,
	badge,
	card,
	easeOut,
	hex2rgba,
	lerp,
	miniSidebar,
	progressBar,
	txt,
	txtW,
	vBar,
} from "../draw"

function drawBase(ctx: CanvasRenderingContext2D, w: number, h: number) {
	miniSidebar(ctx, 0, 0, h, 0)
	// Header
	ctx.fillStyle = C.card
	ctx.fillRect(44, 0, w - 44, 28)
	ctx.strokeStyle = C.border
	ctx.lineWidth = 1
	ctx.beginPath()
	ctx.moveTo(44, 28)
	ctx.lineTo(w, 28)
	ctx.stroke()
	txt(ctx, "Dashboard", 56, 14, { size: 11, weight: "600" })
	txt(ctx, "Visão geral", 148, 14, { size: 9, color: C.muted })
}

function summaryCard(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	label: string,
	value: string,
	color: string,
	slideT: number,
) {
	const ey = easeOut(slideT)
	ctx.globalAlpha = ey
	const dy = lerp(12, 0, ey)
	card(ctx, x, y + dy, w, 52, 7)
	txt(ctx, label.toUpperCase(), x + 8, y + dy + 14, {
		size: 7,
		color: C.muted,
		weight: "600",
	})
	txt(ctx, value, x + 8, y + dy + 34, {
		size: 13,
		color,
		weight: "700",
		mono: true,
	})
	ctx.globalAlpha = 1
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"]
const INCOME_DATA = [0.45, 0.6, 0.5, 0.7, 0.55, 0.75]
const EXPENSE_DATA = [0.35, 0.45, 0.4, 0.5, 0.42, 0.58]

const CATEGORIES = [
	{ label: "Alimentação", pct: 0.32, color: C.expense },
	{ label: "Moradia", pct: 0.28, color: C.orange },
	{ label: "Transporte", pct: 0.18, color: C.blue },
	{ label: "Saúde", pct: 0.12, color: C.purple },
	{ label: "Outro", pct: 0.1, color: C.muted },
]

export const dashboardDemo: AnimStep[] = [
	// Layout fades in
	{
		duration: 700,
		draw(ctx, t, w, h) {
			ctx.globalAlpha = easeOut(t)
			drawBase(ctx, w, h)
			ctx.globalAlpha = 1
		},
	},
	// Cards slide in one by one
	{
		duration: 1400,
		draw(ctx, t, w, h) {
			drawBase(ctx, w, h)
			const cx = 52
			const cw = (w - cx - 8) / 3 - 4
			summaryCard(ctx, cx, 34, cw, "Saldo Total", "R$ 8.420", C.primary, Math.min(1, t * 3))
			summaryCard(ctx, cx + cw + 4, 34, cw, "Receitas", "R$ 6.200", C.primary, Math.min(1, Math.max(0, (t - 0.25) * 3)))
			summaryCard(ctx, cx + (cw + 4) * 2, 34, cw, "Despesas", "R$ 3.780", C.expense, Math.min(1, Math.max(0, (t - 0.5) * 3)))
		},
	},
	// Chart bars grow
	{
		duration: 2000,
		draw(ctx, t, w, h) {
			drawBase(ctx, w, h)
			const cx = 52
			const cw = (w - cx - 8) / 3 - 4
			summaryCard(ctx, cx, 34, cw, "Saldo Total", "R$ 8.420", C.primary, 1)
			summaryCard(ctx, cx + cw + 4, 34, cw, "Receitas", "R$ 6.200", C.primary, 1)
			summaryCard(ctx, cx + (cw + 4) * 2, 34, cw, "Despesas", "R$ 3.780", C.expense, 1)

			// Chart area
			const chartX = cx
			const chartY = 96
			const chartW = (w - cx - 8) * 0.62
			const chartH = 110
			card(ctx, chartX, chartY, chartW, chartH, 7)
			txt(ctx, "Últimos 6 meses", chartX + 10, chartY + 14, { size: 9, weight: "600" })

			const barW = 10
			const gap = (chartW - 24 - MONTHS.length * barW * 2 - (MONTHS.length - 1) * 8) / MONTHS.length
			const baseY = chartY + chartH - 16
			const maxBarH = chartH - 44

			const ey = easeOut(t)

			for (let i = 0; i < MONTHS.length; i++) {
				const bx = chartX + 12 + i * (barW * 2 + gap + 8)
				vBar(ctx, bx, baseY, barW, maxBarH, INCOME_DATA[i] * ey, hex2rgba(C.primary, 0.85))
				vBar(ctx, bx + barW + 2, baseY, barW, maxBarH, EXPENSE_DATA[i] * ey, hex2rgba(C.expense, 0.85))
				txt(ctx, MONTHS[i], bx + barW, baseY + 8, { size: 7, color: C.muted, align: "center" })
			}
		},
	},
	// Category bars fill
	{
		duration: 2000,
		draw(ctx, t, w, h) {
			drawBase(ctx, w, h)
			const cx = 52
			const cw = (w - cx - 8) / 3 - 4

			summaryCard(ctx, cx, 34, cw, "Saldo Total", "R$ 8.420", C.primary, 1)
			summaryCard(ctx, cx + cw + 4, 34, cw, "Receitas", "R$ 6.200", C.primary, 1)
			summaryCard(ctx, cx + (cw + 4) * 2, 34, cw, "Despesas", "R$ 3.780", C.expense, 1)

			const chartX = cx
			const chartY = 96
			const chartW = (w - cx - 8) * 0.62
			const chartH = 110
			card(ctx, chartX, chartY, chartW, chartH, 7)
			txt(ctx, "Últimos 6 meses", chartX + 10, chartY + 14, { size: 9, weight: "600" })
			const barW = 10
			const gap = (chartW - 24 - MONTHS.length * barW * 2 - (MONTHS.length - 1) * 8) / MONTHS.length
			const baseY = chartY + chartH - 16
			const maxBarH = chartH - 44
			for (let i = 0; i < MONTHS.length; i++) {
				const bx = chartX + 12 + i * (barW * 2 + gap + 8)
				vBar(ctx, bx, baseY, barW, maxBarH, INCOME_DATA[i], hex2rgba(C.primary, 0.85))
				vBar(ctx, bx + barW + 2, baseY, barW, maxBarH, EXPENSE_DATA[i], hex2rgba(C.expense, 0.85))
				txt(ctx, MONTHS[i], bx + barW, baseY + 8, { size: 7, color: C.muted, align: "center" })
			}

			// Category chart
			const catX = chartX + chartW + 4
			const catW = w - catX - 4
			card(ctx, catX, chartY, catW, chartH, 7)
			txt(ctx, "Categorias", catX + 10, chartY + 14, { size: 9, weight: "600" })
			const ey = easeOut(t)
			CATEGORIES.forEach((cat, i) => {
				const cy = chartY + 28 + i * 17
				txt(ctx, cat.label, catX + 10, cy, { size: 8, color: C.muted })
				progressBar(ctx, catX + 10, cy + 7, catW - 20, 5, cat.pct * ey, cat.color)
			})
		},
	},
	// Pause showing complete state
	{
		duration: 1200,
		draw(ctx, t, w, h) {
			drawBase(ctx, w, h)
			const cx = 52
			const cw = (w - cx - 8) / 3 - 4
			summaryCard(ctx, cx, 34, cw, "Saldo Total", "R$ 8.420", C.primary, 1)
			summaryCard(ctx, cx + cw + 4, 34, cw, "Receitas", "R$ 6.200", C.primary, 1)
			summaryCard(ctx, cx + (cw + 4) * 2, 34, cw, "Despesas", "R$ 3.780", C.expense, 1)

			const chartX = cx
			const chartY = 96
			const chartW = (w - cx - 8) * 0.62
			const chartH = 110
			card(ctx, chartX, chartY, chartW, chartH, 7)
			txt(ctx, "Últimos 6 meses", chartX + 10, chartY + 14, { size: 9, weight: "600" })
			const barW = 10
			const gap = (chartW - 24 - MONTHS.length * barW * 2 - (MONTHS.length - 1) * 8) / MONTHS.length
			const baseY = chartY + chartH - 16
			const maxBarH = chartH - 44
			for (let i = 0; i < MONTHS.length; i++) {
				const bx = chartX + 12 + i * (barW * 2 + gap + 8)
				vBar(ctx, bx, baseY, barW, maxBarH, INCOME_DATA[i], hex2rgba(C.primary, 0.85))
				vBar(ctx, bx + barW + 2, baseY, barW, maxBarH, EXPENSE_DATA[i], hex2rgba(C.expense, 0.85))
				txt(ctx, MONTHS[i], bx + barW, baseY + 8, { size: 7, color: C.muted, align: "center" })
			}

			const catX = chartX + chartW + 4
			const catW = w - catX - 4
			card(ctx, catX, chartY, catW, chartH, 7)
			txt(ctx, "Categorias", catX + 10, chartY + 14, { size: 9, weight: "600" })
			CATEGORIES.forEach((cat, i) => {
				const cy = chartY + 28 + i * 17
				txt(ctx, cat.label, catX + 10, cy, { size: 8, color: C.muted })
				progressBar(ctx, catX + 10, cy + 7, catW - 20, 5, cat.pct, cat.color)
			})

			// Legend
			const bw = badge(ctx, chartX + 10, chartY + chartH + 10, "Receitas", C.primary)
			badge(ctx, chartX + 10 + bw + 8, chartY + chartH + 10, "Despesas", C.expense)
		},
	},
]
