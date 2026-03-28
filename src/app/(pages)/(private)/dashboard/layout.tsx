import { Separator } from "@/components/ui/separator"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger
} from "@/components/ui/sidebar"
import {
	ArrowLeftRightIcon,
	LayoutDashboardIcon,
	SettingsIcon,
	WalletIcon,
} from "lucide-react"
import { SidebarSignOutButton } from "@/components/sidebar-sign-out-button"
import Link from "next/link"

const navItems = [
	{
		label: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboardIcon
	},
	{
		label: "Transações",
		href: "/dashboard/transactions",
		icon: ArrowLeftRightIcon,
	},
	{
		label: "Contas",
		href: "/dashboard/accounts",
		icon: WalletIcon
	},
]

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<SidebarProvider>
			<Sidebar collapsible="icon">
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Oraha</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{navItems.map((item) => (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton render={<Link href={item.href} />}>
											<item.icon />
											{item.label}
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton render={<Link href="/dashboard/settings" />}>
								<SettingsIcon />
								Configurações
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarSignOutButton />
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
			<SidebarInset>
				<header className="flex h-12 items-center gap-2 px-4 border-b">
					<SidebarTrigger />
				</header>
				<main className="flex flex-1 flex-col gap-6 p-6">
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	)
}
