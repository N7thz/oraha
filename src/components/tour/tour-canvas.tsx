"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { useTour } from "./tour-context"

type Rect = { x: number; y: number; width: number; height: number }

const PADDING = 14
const RADIUS = 14
const LERP_SPEED = 0.13

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t
}

function lerpRect(from: Rect, to: Rect, t: number): Rect {
	return {
		x: lerp(from.x, to.x, t),
		y: lerp(from.y, to.y, t),
		width: lerp(from.width, to.width, t),
		height: lerp(from.height, to.height, t),
	}
}

function isCloseEnough(a: Rect, b: Rect, threshold = 0.5): boolean {
	return (
		Math.abs(a.x - b.x) < threshold &&
		Math.abs(a.y - b.y) < threshold &&
		Math.abs(a.width - b.width) < threshold &&
		Math.abs(a.height - b.height) < threshold
	)
}

function drawSpotlight(
	ctx: CanvasRenderingContext2D,
	rect: Rect,
	pulse: number,
) {
	const { x, y, width, height } = rect
	const canvas = ctx.canvas
	const sx = x - PADDING
	const sy = y - PADDING
	const sw = width + PADDING * 2
	const sh = height + PADDING * 2

	ctx.clearRect(0, 0, canvas.width, canvas.height)

	// Dark overlay
	ctx.fillStyle = "rgba(0, 0, 0, 0.72)"
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	// Transparent cutout
	ctx.globalCompositeOperation = "destination-out"
	ctx.beginPath()
	ctx.roundRect(sx, sy, sw, sh, RADIUS)
	ctx.fill()
	ctx.globalCompositeOperation = "source-over"

	// Pulsing ring
	const ringOpacity = 0.35 + Math.sin(pulse) * 0.25
	ctx.beginPath()
	ctx.roundRect(sx, sy, sw, sh, RADIUS)
	ctx.strokeStyle = `rgba(75, 222, 124, ${ringOpacity})`
	ctx.lineWidth = 2
	ctx.stroke()

	// Subtle inner glow
	const glowOpacity = 0.06 + Math.sin(pulse + 1) * 0.04
	ctx.beginPath()
	ctx.roundRect(sx + 1, sy + 1, sw - 2, sh - 2, RADIUS - 1)
	ctx.strokeStyle = `rgba(75, 222, 124, ${glowOpacity})`
	ctx.lineWidth = 8
	ctx.stroke()
}

export function TourCanvas() {
	const { isActive, step } = useTour()
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const currentRectRef = useRef<Rect | null>(null)
	const targetRectRef = useRef<Rect | null>(null)
	const animFrameRef = useRef<number | null>(null)
	const pulseRef = useRef(0)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	// Track target element position
	useEffect(() => {
		if (!isActive || !step?.target) {
			targetRectRef.current = null
			return
		}

		function updateTarget() {
			const el = document.querySelector(`[data-tour="${step?.target}"]`)
			if (el) {
				const r = el.getBoundingClientRect()
				targetRectRef.current = {
					x: r.x,
					y: r.y,
					width: r.width,
					height: r.height,
				}
			}
		}

		updateTarget()

		const observer = new ResizeObserver(updateTarget)
		const el = document.querySelector(`[data-tour="${step.target}"]`)
		if (el) observer.observe(el)

		window.addEventListener("resize", updateTarget)
		window.addEventListener("scroll", updateTarget, { passive: true })

		return () => {
			observer.disconnect()
			window.removeEventListener("resize", updateTarget)
			window.removeEventListener("scroll", updateTarget)
		}
	}, [isActive, step?.target])

	// Reset current rect on step change so spotlight jumps instantly
	useEffect(() => {
		currentRectRef.current = null
	}, [step?.id])

	// Animation loop
	useEffect(() => {
		if (!isActive) {
			if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
			const canvas = canvasRef.current
			if (canvas) {
				const ctx = canvas.getContext("2d")
				ctx?.clearRect(0, 0, canvas.width, canvas.height)
			}
			return
		}

		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext("2d")
		if (!ctx) return

		function resize() {
			if (!canvas) return
			canvas.width = window.innerWidth
			canvas.height = window.innerHeight
		}

		resize()
		window.addEventListener("resize", resize)

		function animate() {
			if (!canvas || !ctx) return

			pulseRef.current += 0.055
			const target = targetRectRef.current

			if (!target) {
				ctx.clearRect(0, 0, canvas.width, canvas.height)
				ctx.fillStyle = "rgba(0, 0, 0, 0.72)"
				ctx.fillRect(0, 0, canvas.width, canvas.height)
				animFrameRef.current = requestAnimationFrame(animate)
				return
			}

			if (!currentRectRef.current) {
				currentRectRef.current = { ...target }
			} else if (!isCloseEnough(currentRectRef.current, target)) {
				currentRectRef.current = lerpRect(
					currentRectRef.current,
					target,
					LERP_SPEED,
				)
			} else {
				currentRectRef.current = { ...target }
			}

			drawSpotlight(ctx, currentRectRef.current, pulseRef.current)
			animFrameRef.current = requestAnimationFrame(animate)
		}

		animate()

		return () => {
			window.removeEventListener("resize", resize)
			if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
		}
	}, [isActive])

	if (!mounted || !isActive) return null

	return createPortal(
		<canvas
			ref={canvasRef}
			className="pointer-events-none fixed inset-0 z-50"
			aria-hidden="true"
		/>,
		document.body,
	)
}
