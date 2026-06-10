"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"

import { useTour } from "./tour-context"

const TOOLTIP_WIDTH = 320
const TOOLTIP_OFFSET = 18

type Position = { top: number; left: number }

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value))
}

function computePosition(
	targetRect: DOMRect | null,
	placement: string,
	tooltipHeight: number,
): Position {
	const padding = 16
	const w = TOOLTIP_WIDTH
	const h = tooltipHeight

	if (!targetRect || placement === "center") {
		return {
			top: window.innerHeight / 2 - h / 2,
			left: window.innerWidth / 2 - w / 2,
		}
	}

	const cx = targetRect.left + targetRect.width / 2
	const cy = targetRect.top + targetRect.height / 2

	switch (placement) {
		case "bottom":
			return {
				top: targetRect.bottom + TOOLTIP_OFFSET,
				left: clamp(cx - w / 2, padding, window.innerWidth - w - padding),
			}
		case "top":
			return {
				top: targetRect.top - TOOLTIP_OFFSET - h,
				left: clamp(cx - w / 2, padding, window.innerWidth - w - padding),
			}
		case "right":
			return {
				top: clamp(cy - h / 2, padding, window.innerHeight - h - padding),
				left: targetRect.right + TOOLTIP_OFFSET,
			}
		case "left":
			return {
				top: clamp(cy - h / 2, padding, window.innerHeight - h - padding),
				left: targetRect.left - TOOLTIP_OFFSET - w,
			}
		default:
			return {
				top: window.innerHeight / 2 - h / 2,
				left: window.innerWidth / 2 - w / 2,
			}
	}
}

function TourTooltipInner() {
	const { isActive, step, currentStep, totalSteps, next, prev, skip } =
		useTour()
	const tooltipRef = useRef<HTMLDivElement>(null)
	const [position, setPosition] = useState<Position>({ top: -9999, left: -9999 })

	useEffect(() => {
		if (!isActive || !step) return

		const el = step.target
			? document.querySelector(`[data-tour="${step.target}"]`)
			: null
		const targetRect = el ? el.getBoundingClientRect() : null
		const h = tooltipRef.current?.offsetHeight ?? 200

		setPosition(computePosition(targetRect, step.placement, h))
	}, [isActive, step, currentStep])

	useEffect(() => {
		if (!isActive || !step) return

		function onResize() {
			const el = step?.target
				? document.querySelector(`[data-tour="${step.target}"]`)
				: null
			const targetRect = el ? el.getBoundingClientRect() : null
			const h = tooltipRef.current?.offsetHeight ?? 200
			setPosition(computePosition(targetRect, step?.placement ?? "center", h))
		}

		window.addEventListener("resize", onResize)
		return () => window.removeEventListener("resize", onResize)
	}, [isActive, step])

	if (!isActive || !step) return null

	const isFirst = currentStep === 0
	const isLast = currentStep === totalSteps - 1

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={currentStep}
				ref={tooltipRef}
				initial={{ opacity: 0, scale: 0.94, y: 8 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.94, y: 8 }}
				transition={{ duration: 0.18, ease: "easeOut" }}
				className="fixed z-[51] flex flex-col gap-4 rounded-xl p-5 shadow-2xl"
				style={{
					top: position.top,
					left: position.left,
					width: TOOLTIP_WIDTH,
					background: "var(--card)",
					border: "1px solid rgba(75, 222, 124, 0.22)",
					boxShadow:
						"0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(75,222,124,0.1)",
				}}
			>
				{/* Progress dots */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-1">
						{Array.from({ length: totalSteps }).map((_, i) => (
							<div
								key={i}
								className="h-1 rounded-full transition-all duration-300"
								style={{
									width: i === currentStep ? 18 : 5,
									background:
										i === currentStep
											? "#4bde7c"
											: i < currentStep
												? "rgba(75,222,124,0.4)"
												: "var(--border)",
								}}
							/>
						))}
					</div>
					<span
						className="text-[0.62rem] tabular-nums"
						style={{ color: "var(--muted-foreground)" }}
					>
						{currentStep + 1} / {totalSteps}
					</span>
				</div>

				{/* Content */}
				<div>
					<h3 className="mb-1.5 text-sm font-semibold leading-snug">
						{step.title}
					</h3>
					<p
						className="text-xs leading-relaxed"
						style={{ color: "var(--muted-foreground)" }}
					>
						{step.description}
					</p>
				</div>

				{/* Actions */}
				<div className="flex items-center justify-between">
					<button
						type="button"
						onClick={skip}
						className="text-xs transition-colors"
						style={{ color: "var(--muted-foreground)" }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = "var(--foreground)"
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = "var(--muted-foreground)"
						}}
					>
						Pular tour
					</button>
					<div className="flex items-center gap-2">
						{!isFirst && (
							<button
								type="button"
								onClick={prev}
								className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
								style={{
									border: "1px solid var(--border)",
									background: "transparent",
									color: "var(--foreground)",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = "var(--muted)"
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = "transparent"
								}}
							>
								Voltar
							</button>
						)}
						<button
							type="button"
							onClick={next}
							className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
							style={{
								background: "#4bde7c",
								color: "#0b1e13",
							}}
						>
							{isLast ? "Concluir" : "Próximo"}
						</button>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	)
}

export function TourTooltip() {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	return createPortal(<TourTooltipInner />, document.body)
}
