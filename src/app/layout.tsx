import { QueryProvider } from "@/components/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { DM_Serif_Display, Josefin_Sans, Space_Mono } from "next/font/google"
import "./globals.css"

const josefinSans = Josefin_Sans({
	subsets: ["latin"],
	variable: "--font-sans",
	weight: ["100", "300", "400", "600", "700"],
})

const dmSerifDisplay = DM_Serif_Display({
	subsets: ["latin"],
	variable: "--font-display",
	weight: "400",
	style: ["normal", "italic"],
})

const spaceMono = Space_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	weight: ["400", "700"],
})

export const metadata: Metadata = {
	title: "Oraha — Gestão Financeira",
	description: "Controle financeiro pessoal",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="pt-BR"
			suppressHydrationWarning
			className={cn(
				"font-sans",
				josefinSans.variable,
				dmSerifDisplay.variable,
				spaceMono.variable,
			)}
		>
			<head />
			<body>
				<QueryProvider>
					<ThemeProvider attribute="class" defaultTheme="dark">
						<TooltipProvider>
							{children}
						</TooltipProvider>
						<Toaster />
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	)
}
