<script lang="ts">
	import { page } from '$app/stores';
	import { Home, Wallet, Receipt, Calculator, ChartLine, Settings, ChevronRight, Droplets, Building, TrendingUp, TrendingUpDown, CreditCard, Menu } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';

	let assetsOpen = $state(false);
	let sidebarOpen = $state(true);
	
	$effect(() => {
		// Auto-open assets menu if we're on an assets page
		if ($page.url.pathname.startsWith('/assets')) {
			assetsOpen = true;
		}
	});
	
	const menuItems = [
		{ href: '/', label: 'Dashboard', icon: Home },
		{ href: '/networth', label: 'Net Worth', icon: TrendingUpDown },
		{ 
			href: '/assets', 
			label: 'Assets', 
			icon: Wallet,
			subItems: [
				{ href: '/assets/liquid', label: 'Liquid Assets', icon: Droplets },
				{ href: '/assets/non-liquid', label: 'Non-Liquid Assets', icon: Building },
				{ href: '/assets/investment', label: 'Investment', icon: TrendingUp }
			]
		},
		{ href: '/debts', label: 'Debts', icon: CreditCard },
		{ href: '/transactions', label: 'Transactions', icon: Receipt },
		{ href: '/settings', label: 'Settings', icon: Settings }
	];
</script>

<!-- Custom Sidebar Component -->
<aside class="fixed left-0 top-0 z-40 h-screen w-64 transition-transform duration-300 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}">
	<div class="flex h-full flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
		<!-- Header -->
		<div class="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Saldoify</h1>
			<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Personal Finance Manager</p>
		</div>
		
		<!-- Navigation -->
		<nav class="flex-1 overflow-y-auto px-4 py-6">
			<div class="space-y-1">
				{#each menuItems as item}
					{#if item.subItems}
						<!-- Collapsible menu item -->
						<div class="space-y-1">
							<button
								onclick={() => assetsOpen = !assetsOpen}
								class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
									{$page.url.pathname.startsWith(item.href) 
										? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600' 
										: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}"
							>
								<div class="flex items-center gap-3">
									<div class="{$page.url.pathname.startsWith(item.href) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}">
										<svelte:component this={item.icon} class="h-5 w-5" />
									</div>
									<span>{item.label}</span>
								</div>
								<ChevronRight class="h-4 w-4 transition-transform duration-200 {assetsOpen ? 'rotate-90' : ''}" />
							</button>
							
							{#if assetsOpen}
								<div class="ml-4 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
									{#each item.subItems as subItem}
										<a
											href={subItem.href}
											class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200
												{$page.url.pathname === subItem.href 
													? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-blue-700 dark:text-blue-300 font-medium' 
													: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}"
										>
											<div class="{$page.url.pathname === subItem.href ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}">
												<svelte:component this={subItem.icon} class="h-4 w-4" />
											</div>
											<span>{subItem.label}</span>
										</a>
									{/each}
								</div>
							{/if}
						</div>
					{:else}
						<!-- Regular menu item -->
						<a
							href={item.href}
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
								{$page.url.pathname === item.href 
									? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600' 
									: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}"
						>
							<div class="{$page.url.pathname === item.href ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}">
								<svelte:component this={item.icon} class="h-5 w-5" />
							</div>
							<span>{item.label}</span>
						</a>
					{/if}
				{/each}
			</div>
		</nav>
		
		<!-- Footer -->
		<div class="border-t border-gray-200 dark:border-gray-800 p-4">
			<div class="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
				<p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Welcome back!</p>
				<Button href="/demo/lucia" class="w-full bg-blue-600 hover:bg-blue-700 text-white border-0">
					Demo Login
				</Button>
			</div>
		</div>
	</div>
</aside>

<!-- Mobile toggle button -->
<button
	onclick={() => sidebarOpen = !sidebarOpen}
	class="fixed left-4 top-4 z-50 rounded-lg bg-white dark:bg-gray-900 p-2 shadow-lg lg:hidden"
>
	<Menu class="h-5 w-5" />
</button>