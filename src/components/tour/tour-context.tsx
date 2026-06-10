"use client"

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react"

import { TOUR_STEPS } from "./tour-steps"

const STORAGE_KEY = "oraha_tour_completed"

type TourContextType = {
	isActive: boolean
	currentStep: number
	totalSteps: number
	step: (typeof TOUR_STEPS)[number] | null
	next: () => void
	prev: () => void
	skip: () => void
	start: () => void
}

const TourContext = createContext<TourContextType | null>(null)

export function TourProvider({ children }: { children: React.ReactNode }) {
	const [isActive, setIsActive] = useState(false)
	const [currentStep, setCurrentStep] = useState(0)

	useEffect(() => {
		const completed = localStorage.getItem(STORAGE_KEY)
		if (!completed) {
			const timer = setTimeout(() => setIsActive(true), 600)
			return () => clearTimeout(timer)
		}
	}, [])

	const next = useCallback(() => {
		if (currentStep < TOUR_STEPS.length - 1) {
			setCurrentStep((s) => s + 1)
		} else {
			localStorage.setItem(STORAGE_KEY, "true")
			setIsActive(false)
			setCurrentStep(0)
		}
	}, [currentStep])

	const prev = useCallback(() => {
		setCurrentStep((s) => Math.max(0, s - 1))
	}, [])

	const skip = useCallback(() => {
		localStorage.setItem(STORAGE_KEY, "true")
		setIsActive(false)
		setCurrentStep(0)
	}, [])

	const start = useCallback(() => {
		localStorage.removeItem(STORAGE_KEY)
		setCurrentStep(0)
		setIsActive(true)
	}, [])

	const step = isActive ? TOUR_STEPS[currentStep] : null

	return (
		<TourContext.Provider
			value={{
				isActive,
				currentStep,
				totalSteps: TOUR_STEPS.length,
				step,
				next,
				prev,
				skip,
				start,
			}}
		>
			{children}
		</TourContext.Provider>
	)
}

export function useTour() {
	const ctx = useContext(TourContext)
	if (!ctx) throw new Error("useTour must be used within TourProvider")
	return ctx
}
