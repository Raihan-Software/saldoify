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
		SidebarMenuItem,
		SidebarMenuSub,
		SidebarMenuSubItem,
		SidebarMenuSubButton
	} from '$lib/components/ui/sidebar';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Button } from '$lib/components/ui/button';
	import { Home, Wallet, Receipt, Calculator, ChartLine, Settings, ChevronRight, Droplets, Building, TrendingUp } from '@lucide/svelte';

	let assetsOpen = $state(false);
	
	$effect(() => {
		// Auto-open assets menu if we're on an assets page
		if ($page.url.pathname.startsWith('/assets')) {
			assetsOpen = true;
		}
	});
</script>

<Sidebar>
	<SidebarHeader>
		<div class="px-2 py-2">
			<h1 class="text-xl font-bold">Saldoify</h1>
		</div>
	</SidebarHeader>
	
	<SidebarContent>
		<SidebarGroup>
			<SidebarGroupLabel>Navigation</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					<!-- Dashboard -->
					<SidebarMenuItem>
						<SidebarMenuButton href="/" isActive={$page.url.pathname === '/'}>
							<Home class="h-4 w-4" />
							<span>Dashboard</span>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<!-- Assets with submenu -->
					<Collapsible.Root bind:open={assetsOpen} class="group/collapsible">
						<SidebarMenuItem>
							<Collapsible.Trigger asChild>
								{#snippet child({ props })}
									<SidebarMenuButton 
										{...props}
										isActive={$page.url.pathname.startsWith('/assets')}
									>
										<Wallet class="h-4 w-4" />
										<span>Assets</span>
										<ChevronRight class="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
									</SidebarMenuButton>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<SidebarMenuSub>
									<SidebarMenuSubItem>
										<SidebarMenuSubButton 
											href="/assets/liquid" 
											isActive={$page.url.pathname === '/assets/liquid'}
										>
											<Droplets class="h-3 w-3" />
											<span>Liquid Assets</span>
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
									<SidebarMenuSubItem>
										<SidebarMenuSubButton 
											href="/assets/non-liquid" 
											isActive={$page.url.pathname === '/assets/non-liquid'}
										>
											<Building class="h-3 w-3" />
											<span>Non-Liquid Assets</span>
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
									<SidebarMenuSubItem>
										<SidebarMenuSubButton 
											href="/assets/investment" 
											isActive={$page.url.pathname === '/assets/investment'}
										>
											<TrendingUp class="h-3 w-3" />
											<span>Investment</span>
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
								</SidebarMenuSub>
							</Collapsible.Content>
						</SidebarMenuItem>
					</Collapsible.Root>

					<!-- Transactions -->
					<SidebarMenuItem>
						<SidebarMenuButton href="/transactions" isActive={$page.url.pathname === '/transactions'}>
							<Receipt class="h-4 w-4" />
							<span>Transactions</span>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<!-- Budgets -->
					<SidebarMenuItem>
						<SidebarMenuButton href="/budgets" isActive={$page.url.pathname === '/budgets'}>
							<Calculator class="h-4 w-4" />
							<span>Budgets</span>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<!-- Reports -->
					<SidebarMenuItem>
						<SidebarMenuButton href="/reports" isActive={$page.url.pathname === '/reports'}>
							<ChartLine class="h-4 w-4" />
							<span>Reports</span>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<!-- Settings -->
					<SidebarMenuItem>
						<SidebarMenuButton href="/settings" isActive={$page.url.pathname === '/settings'}>
							<Settings class="h-4 w-4" />
							<span>Settings</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
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