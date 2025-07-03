<script lang="ts">
	import { page } from '$app/stores';
	import {
		Sidebar,
		SidebarContent,
		SidebarFooter,
		SidebarGroup,
		SidebarGroupContent,
		SidebarGroupLabel,
		SidebarHeader,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem
	} from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';
	import { Home, Wallet, Receipt, Calculator, ChartLine, Settings } from '@lucide/svelte';

	const menuItems = [
		{ href: '/', label: 'Dashboard', icon: Home },
		{ href: '/assets', label: 'Assets', icon: Wallet },
		{ href: '/transactions', label: 'Transactions', icon: Receipt },
		{ href: '/budgets', label: 'Budgets', icon: Calculator },
		{ href: '/reports', label: 'Reports', icon: ChartLine },
		{ href: '/settings', label: 'Settings', icon: Settings }
	];
</script>

<Sidebar>
	<SidebarHeader>
		<div class="px-2 py-2">
			<h1 class="text-xl font-bold">Personal Finance</h1>
		</div>
	</SidebarHeader>
	
	<SidebarContent>
		<SidebarGroup>
			<SidebarGroupLabel>Navigation</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{#each menuItems as item}
						<SidebarMenuItem>
							<SidebarMenuButton 
								isActive={$page.url.pathname === item.href}
							>
								{#snippet child({ props })}
									<a href={item.href} {...props}>
										<svelte:component this={item.icon} class="h-4 w-4" />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</SidebarMenuButton>
						</SidebarMenuItem>
					{/each}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	</SidebarContent>
	
	<SidebarFooter>
		<div class="p-2">
			<Button variant="outline" href="/demo/lucia" class="w-full">
				Demo Login
			</Button>
		</div>
	</SidebarFooter>
</Sidebar>