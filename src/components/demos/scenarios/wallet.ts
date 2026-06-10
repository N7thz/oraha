import type { AnimStep } from "../engine"
import {
	C,
	badge,
	btn,
	card,
	clamp,
	cursor,
	dialog,
	easeOut,
	hex2rgba,
	inputF,
	lerp,
	miniSidebar,
	toast,
	txt,
} from "../draw"

type WalletCard = { name: string; type: string; balance: string; color: string }

function walletCard(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	wc: WalletCard,
	alpha = 1,
) {
	ctx.globalAlpha = alpha
	card(ctx, x, y, 100, 72, 8)
	// Icon circle
	ctx.beginPath()
	ctx.arc(x + 16, y + 20, 10, 0, Math.PI * 2)
	ctx.fillStyle = hex2rgba(wc.color, 0.15)
	ctx.fill()
	txt(ctx, "◎", x + 16, y + 20, { size: 10, color: wc.color, align: "center" })
	txt(ctx, wc.name, x + 10, y + 38, { size: 10, weight: "600" })
	txt(ctx, wc.type, x + 10, y + 50, { size: 8, color: C.muted })
	txt(ctx, wc.balance, x + 10, y + 63, { size: 9, color: wc.color, weight: "600", mono: true })
	ctx.globalAlpha = 1
}

function base(ctx: CanvasRenderingContext2D, w: number, h: number) {
	miniSidebar(ctx, 0, 0, h, 2)
	ctx.fillStyle = C.card
	ctx.fillRect(44, 0, w - 44, 28)
	ctx.strokeStyle = C.border
	ctx.lineWidth = 1
	ctx.beginPath()
	ctx.moveTo(44, 28)
	ctx.lineTo(w, 28)
	ctx.stroke()
	txt(ctx, "Carteiras", 56, 14, { size: 11, weight: "600" })
}

const WALLETS: WalletCard[] = [
	{ name: "Nubank", type: "Conta Corrente", balance: "R$ 3.420,00", color: C.purple },
	{ name: "Inter", type: "Poupança", balance: "R$ 5.000,00", color: C.orange },
]

export const walletDemo: AnimStep[] = [
	// Show page with existing wallets
	{
		duration: 1000,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			const ey = easeOut(t)
			ctx.globalAlpha = ey
			btn(ctx, w - 110, 34, 102, 24, "+ Nova carteira", "ghost")
			txt(ctx, "Suas carteiras", 56, 44, { size: 10, weight: "600" })
			walletCard(ctx, 52, 54, WALLETS[0])
			walletCard(ctx, 158, 54, WALLETS[1])
			ctx.globalAlpha = 1
		},
	},
	// Cursor moves to button
	{
		duration: 800,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			btn(ctx, w - 110, 34, 102, 24, "+ Nova carteira", "ghost")
			txt(ctx, "Suas carteiras", 56, 44, { size: 10, weight: "600" })
			walletCard(ctx, 52, 54, WALLETS[0])
			walletCard(ctx, 158, 54, WALLETS[1])
			const ey = easeOut(t)
			cursor(ctx, lerp(w - 60, w - 80, ey), lerp(h - 30, 42, ey))
		},
	},
	// Dialog appears
	{
		duration: 1200,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			btn(ctx, w - 110, 34, 102, 24, "+ Nova carteira", "ghost")
			txt(ctx, "Suas carteiras", 56, 44, { size: 10, weight: "600" })
			walletCard(ctx, 52, 54, WALLETS[0])
			walletCard(ctx, 158, 54, WALLETS[1])
			cursor(ctx, w - 80, 42, t < 0.25)

			if (t > 0.15) {
				ctx.fillStyle = "rgba(0,0,0,0.5)"
				ctx.fillRect(0, 0, w, h)
				dialog(ctx, w / 2 - 100, h / 2 - 87, 200, 175, "Nova carteira", clamp((t - 0.15) / 0.85, 0, 1))
			}
		},
	},
	// Fill form
	{
		duration: 3000,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			ctx.fillStyle = "rgba(0,0,0,0.5)"
			ctx.fillRect(0, 0, w, h)

			const dw = 200
			const dh = 175
			const dx = w / 2 - dw / 2
			const dy = h / 2 - dh / 2

			card(ctx, dx, dy, dw, dh, 10)
			txt(ctx, "Nova carteira", dx + 14, dy + 18, { size: 12, weight: "600" })

			const t1 = clamp(t / 0.3, 0, 1)
			const t2 = clamp((t - 0.35) / 0.3, 0, 1)
			const t3 = clamp((t - 0.65) / 0.3, 0, 1)

			function typed(full: string, pt: number) {
				return full.slice(0, Math.ceil(full.length * pt))
			}

			// Compact 22px fields with 12px gaps
			inputF(ctx, dx + 14, dy + 44, dw - 28, "Nome", typed("Caixinha", t1), t1 > 0 && t1 < 1, 22)
			inputF(ctx, dx + 14, dy + 80, dw - 28, "Tipo", typed("Poupança", t2), t2 > 0 && t2 < 1, 22)
			inputF(ctx, dx + 14, dy + 116, dw - 28, "Saldo inicial", typed("R$ 2.500,00", t3), t3 > 0 && t3 < 1, 22)

			btn(ctx, dx + 14, dy + dh - 28, 60, 20, "Cancelar", "outline")
			btn(ctx, dx + 84, dy + dh - 28, 100, 20, "Salvar")

			// Cursor
			const cx = t < 0.35 ? dx + 70 : t < 0.65 ? dx + 70 : t < 0.95 ? dx + 70 : lerp(dx + 70, dx + 134, easeOut((t - 0.95) / 0.05))
			const cy = t < 0.35 ? dy + 55 : t < 0.65 ? dy + 91 : t < 0.95 ? dy + 127 : dy + dh - 18
			cursor(ctx, cx, cy)
		},
	},
	// New card appears
	{
		duration: 1800,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			btn(ctx, w - 110, 34, 102, 24, "+ Nova carteira", "ghost")
			txt(ctx, "Suas carteiras", 56, 44, { size: 10, weight: "600" })
			walletCard(ctx, 52, 54, WALLETS[0])
			walletCard(ctx, 158, 54, WALLETS[1])

			// New wallet card slides in
			const nt = clamp((t - 0.1) / 0.5, 0, 1)
			const ey = easeOut(nt)
			walletCard(
				ctx,
				264,
				54 + lerp(20, 0, ey),
				{ name: "Caixinha", type: "Poupança", balance: "R$ 2.500,00", color: C.blue },
				ey,
			)

			if (t > 0.4) {
				toast(ctx, w / 2 - 90, 32, "Carteira criada!", clamp((t - 0.4) / 0.3, 0, 1))
			}
		},
	},
]
