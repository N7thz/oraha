"use client"

import { SidebarSignOutButton } from "@/components/sidebar-sign-out-button"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
	ArrowLeftRightIcon,
	HelpCircleIcon,
	LayoutDashboardIcon,
	RepeatIcon,
	SettingsIcon,
	WalletIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
	{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon, exact: true, tourId: undefined },
	{ label: "Transações", href: "/dashboard/transactions", icon: ArrowLeftRightIcon, tourId: "nav-transactions" },
	{ label: "Carteiras", href: "/dashboard/wallets", icon: WalletIcon, tourId: "nav-wallets" },
	{ label: "Recorrentes", href: "/dashboard/recurring", icon: RepeatIcon, tourId: "nav-recurring" },
	{ label: "Ajuda", href: "/dashboard/help", icon: HelpCircleIcon, tourId: "nav-help" },
]

export function AppSidebar() {
	const pathname = usePathname()

	function isActive(href: string, exact = false) {
		return exact ? pathname === href : pathname.startsWith(href)
	}

	return (
		<Sidebar collapsible="icon">
			<SidebarContent>
				<SidebarGroup>
					{/* Wordmark */}
					<div className="flex h-12 items-center px-3 mb-1">
						<span className="font-display italic text-2xl tracking-tight text-foreground truncate group-data-[collapsible=icon]:hidden">
							Oraha.
						</span>
						<span className="font-display italic text-2xl tracking-tight text-foreground hidden group-data-[collapsible=icon]:block">
							O.
						</span>
					</div>

					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => {
								const active = isActive(item.href, item.exact)
								return (
									<SidebarMenuItem key={item.href}>
										<Link
											href={item.href}
											data-tour={item.tourId}
											className={cn(
												"flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150",
												"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
												active
													? "bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary pl-[calc(0.625rem-2px)]"
													: "text-sidebar-foreground/70 border-l-2 border-transparent",
											)}
										>
											<item.icon
												className={cn(
													"size-4 shrink-0 transition-colors",
													active
														? "text-sidebar-primary"
														: "text-sidebar-foreground/50",
												)}
											/>
											<span className="truncate group-data-[collapsible=icon]:hidden">
												{item.label}
											</span>
										</Link>
									</SidebarMenuItem>
								)
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<AnimatedThemeToggler className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center [&_svg]:size-4" />
					</SidebarMenuItem>
					<SidebarMenuItem>
						<Link
							href="/dashboard/settings"
							className={cn(
								"flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150",
								"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
								isActive("/dashboard/settings")
									? "bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary pl-[calc(0.625rem-2px)]"
									: "text-sidebar-foreground/70 border-l-2 border-transparent",
							)}
						>
							<SettingsIcon
								className={cn(
									"size-4 shrink-0",
									isActive("/dashboard/settings")
										? "text-sidebar-primary"
										: "text-sidebar-foreground/50",
								)}
							/>
							<span className="truncate group-data-[collapsible=icon]:hidden">
								Configurações
							</span>
						</Link>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarSignOutButton />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}
