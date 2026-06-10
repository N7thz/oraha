import type { AnimStep } from "../engine"
import {
	C,
	btn,
	card,
	checkmark,
	clamp,
	cursor,
	easeOut,
	fillR,
	hex2rgba,
	lerp,
	miniSidebar,
	strokeR,
	toast,
	txt,
} from "../draw"

function base(ctx: CanvasRenderingContext2D, w: number, h: number) {
	miniSidebar(ctx, 0, 0, h, 1)
	ctx.fillStyle = C.card
	ctx.fillRect(44, 0, w - 44, 28)
	ctx.strokeStyle = C.border
	ctx.lineWidth = 1
	ctx.beginPath()
	ctx.moveTo(44, 28)
	ctx.lineTo(w, 28)
	ctx.stroke()
	txt(ctx, "Dashboard", 56, 14, { size: 11, weight: "600" })
}

type ImportRow = { date: string; type: string; cat: string; val: string; ok: boolean }

const ROWS: ImportRow[] = [
	{ date: "01/06/2026", type: "Receita", cat: "Salário", val: "R$ 6.200,00", ok: true },
	{ date: "03/06/2026", type: "Despesa", cat: "Alimentação", val: "R$ 95,00", ok: true },
	{ date: "05/06/2026", type: "Despesa", cat: "Moradia", val: "R$ 1.200,00", ok: true },
	{ date: "08/06/2026", type: "Despesa", cat: "Transporte", val: "R$ 42,00", ok: true },
	{ date: "09/06", type: "Despesa", cat: "???", val: "R$ 18", ok: false },
	{ date: "10/06/2026", type: "Receita", cat: "Investimento", val: "R$ 320,00", ok: true },
]

export const importDemo: AnimStep[] = [
	// Show page with import button
	{
		duration: 1000,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			ctx.globalAlpha = easeOut(t)
			btn(ctx, w - 112, 34, 104, 24, "Importar planilha", "ghost")
			txt(ctx, "Importar dados históricos", 56, 44, { size: 10, weight: "600" })
			txt(ctx, "Use uma planilha .xlsx ou .csv para importar\ntransações em massa de forma rápida.", 56, 62, {
				size: 9,
				color: C.muted,
			})
			// Spreadsheet icon
			ctx.beginPath()
			ctx.roundRect(w / 2 - 28, 88, 56, 70, 8)
			ctx.fillStyle = hex2rgba(C.primary, 0.08)
			ctx.fill()
			ctx.strokeStyle = hex2rgba(C.primary, 0.2)
			ctx.stroke()
			txt(ctx, "📊", w / 2, 123, { size: 24, align: "center" })
			txt(ctx, ".xlsx / .csv", w / 2, 150, { size: 9, color: C.muted, align: "center" })
			ctx.globalAlpha = 1
		},
	},
	// Cursor to button
	{
		duration: 800,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			btn(ctx, w - 112, 34, 104, 24, "Importar planilha", "ghost")
			txt(ctx, "Importar dados históricos", 56, 44, { size: 10, weight: "600" })

			ctx.beginPath()
			ctx.roundRect(w / 2 - 28, 88, 56, 70, 8)
			ctx.fillStyle = hex2rgba(C.primary, 0.08)
			ctx.fill()
			ctx.strokeStyle = hex2rgba(C.primary, 0.2)
			ctx.stroke()
			txt(ctx, "📊", w / 2, 123, { size: 24, align: "center" })
			txt(ctx, ".xlsx / .csv", w / 2, 150, { size: 9, color: C.muted, align: "center" })

			const ey = easeOut(t)
			cursor(ctx, lerp(w - 60, w - 70, ey), lerp(h - 30, 42, ey))
		},
	},
	// File picker appears (simplified)
	{
		duration: 1200,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			cursor(ctx, w - 70, 42, t < 0.25)

			if (t > 0.2) {
				const ey = easeOut(clamp((t - 0.2) / 0.8, 0, 1))
				ctx.globalAlpha = ey
				// File picker box
				const bw = 220
				const bh = 120
				const bx = w / 2 - bw / 2
				const by = h / 2 - bh / 2
				card(ctx, bx, by, bw, bh, 10)
				txt(ctx, "Selecionar arquivo", bx + 14, by + 18, { size: 11, weight: "600" })
				// Drop zone
				ctx.setLineDash([4, 4])
				strokeR(ctx, bx + 14, by + 34, bw - 28, 60, 8, hex2rgba(C.primary, 0.4), 1.5)
				ctx.setLineDash([])
				txt(ctx, "📂 financeiro_junho.xlsx", bx + bw / 2, by + 62, { size: 10, align: "center" })
				txt(ctx, "Arraste ou clique para selecionar", bx + bw / 2, by + 78, { size: 8, color: C.muted, align: "center" })
				btn(ctx, bx + 14, by + bh - 30, 90, 22, "Cancelar", "outline")
				btn(ctx, bx + 114, by + bh - 30, 90, 22, "Abrir")
				ctx.globalAlpha = 1
			}
		},
	},
	// Preview table with rows appearing
	{
		duration: 2800,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			const bx = 52
			const by = 34

			card(ctx, bx, by, w - 56, h - by - 8, 8)
			txt(ctx, "Pré-visualização — 6 linhas", bx + 10, by + 14, { size: 10, weight: "600" })

			// Column headers
			const cols = [72, 110, 170, 240]
			txt(ctx, "Data", bx + cols[0], by + 26, { size: 7, color: C.muted })
			txt(ctx, "Tipo", bx + cols[1], by + 26, { size: 7, color: C.muted })
			txt(ctx, "Categoria", bx + cols[2], by + 26, { size: 7, color: C.muted })
			txt(ctx, "Valor", bx + cols[3], by + 26, { size: 7, color: C.muted })

			ctx.strokeStyle = C.border
			ctx.lineWidth = 1
			ctx.beginPath()
			ctx.moveTo(bx + 8, by + 32)
			ctx.lineTo(bx + w - 64, by + 32)
			ctx.stroke()

			for (let i = 0; i < ROWS.length; i++) {
				const rowT = clamp((t * ROWS.length - i) / 1, 0, 1)
				if (rowT <= 0) continue
				const row = ROWS[i]
				const ry = by + 36 + i * 19
				const ey = easeOut(rowT)
				ctx.globalAlpha = ey

				if (!row.ok) {
					fillR(ctx, bx + 8, ry - 8, w - 72, 16, 3, hex2rgba(C.expense, 0.08))
				}

				txt(ctx, row.date, bx + cols[0], ry, { size: 8, color: row.ok ? C.text : C.muted })
				txt(ctx, row.type, bx + cols[1], ry, {
					size: 8,
					color: row.type === "Receita" ? C.primary : C.expense,
				})
				txt(ctx, row.cat, bx + cols[2], ry, { size: 8, color: row.ok ? C.text : C.muted })
				txt(ctx, row.val, bx + cols[3], ry, { size: 8, color: row.ok ? C.text : C.muted })

				// Status icon
				if (row.ok) {
					ctx.beginPath()
					ctx.arc(bx + w - 66, ry, 5, 0, Math.PI * 2)
					ctx.fillStyle = hex2rgba(C.primary, 0.15)
					ctx.fill()
					checkmark(ctx, bx + w - 66, ry, 5, C.primary)
				} else {
					txt(ctx, "✕", bx + w - 69, ry, { size: 8, color: C.expense })
				}

				ctx.globalAlpha = 1
			}

			// Bottom bar
			if (t > 0.85) {
				const bt = easeOut(clamp((t - 0.85) / 0.15, 0, 1))
				ctx.globalAlpha = bt
				txt(ctx, "5 válidas · 1 inválida", bx + 10, h - 20, { size: 9, color: C.muted })
				btn(ctx, w - 148, h - 28, 90, 18, "Cancelar", "outline")
				btn(ctx, w - 54, h - 28, 46, 18, "Importar")
				ctx.globalAlpha = 1
			}
		},
	},
	// Import success
	{
		duration: 1600,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			btn(ctx, w - 112, 34, 104, 24, "Importar planilha", "ghost")

			if (t > 0.1) {
				toast(ctx, w / 2 - 100, 32, "5 transações importadas!", clamp((t - 0.1) / 0.4, 0, 1))
			}

			// Show updated card on dashboard
			if (t > 0.5) {
				const nt = easeOut(clamp((t - 0.5) / 0.4, 0, 1))
				ctx.globalAlpha = nt
				const cw = (w - 52 - 8) / 3 - 4
				const CARDS = [
					{ label: "Saldo Total", val: "R$ 8.420,00", color: C.primary },
					{ label: "Receitas", val: "R$ 6.520,00", color: C.primary },
					{ label: "Despesas", val: "R$ 3.780,00", color: C.expense },
				]
				for (let i = 0; i < CARDS.length; i++) {
					const cx = 52 + i * (cw + 4)
					card(ctx, cx, 64, cw, 50, 7)
					txt(ctx, CARDS[i].label.toUpperCase(), cx + 8, 78, { size: 7, color: C.muted, weight: "600" })
					txt(ctx, CARDS[i].val, cx + 8, 100, { size: 12, color: CARDS[i].color, weight: "700", mono: true })
				}
				ctx.globalAlpha = 1
			}
		},
	},
]
