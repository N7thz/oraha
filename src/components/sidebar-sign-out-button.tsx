"use client"

import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"
import { toast } from "sonner"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"

export function SidebarSignOutButton() {
	const router = useRouter()

	async function handleSignOut() {
		
		const { error } = await authClient.signOut()

		if (error) {
			toast.error(error.message ?? "Erro ao sair.")
			return
		}

		router.push("/")
	}

	return (
		<SidebarMenuButton onClick={handleSignOut}>
			<LogOutIcon />
			Sair
		</SidebarMenuButton>
	)
}
