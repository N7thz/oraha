import { AppSidebar } from "@/components/app-sidebar"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-12 items-center gap-2 border-b border-border/50 px-4">
					<SidebarTrigger className="text-muted-foreground hover:text-foreground" />
					<AnimatedThemeToggler className="ml-auto flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&_svg]:size-4" />
				</header>
				<main className="flex flex-1 flex-col gap-6 p-6">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	)
}
