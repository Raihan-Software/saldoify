<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import { 
		TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank, 
		ArrowUpRight, ArrowDownRight, MoreHorizontal, Eye, EyeOff, Receipt
	} from '@lucide/svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	// Use real data from server
	let netWorthData = $derived(data.netWorthData);
	let showBalances = $state(true);
	let recentTransactions = $derived(data.recentTransactions);
	let monthlyData = $derived(data.monthlyData);
	let topCategories = $derived(data.topCategories);
	let accountBalances = $derived(data.accountBalances);
	
	// Get transaction icon based on type
	function getCategoryIcon(type: string): string {
		if (type === 'income') return '💰';
		if (type === 'expense') return '💸';
		return '📊';
	}
	
	// Get transaction color based on type
	function getCategoryColor(type: string): string {
		if (type === 'income') return 'text-green-600';
		if (type === 'expense') return 'text-red-600';
		return 'text-gray-600';
	}
	
	function formatCurrency(amount: number): string {
		if (!showBalances) return `${data.preferences?.currencySymbol || 'Rp'} ***`;
		
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: data.preferences?.currencyCode || 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});
		
		if (data.preferences?.currencyDisplay === 'code') {
			return formatter.format(amount).replace(/[A-Z]{3}/, data.preferences.currencyCode);
		}
		
		return formatter.format(amount);
	}
	
	function formatCompactCurrency(amount: number): string {
		if (!showBalances) return '***';
		
		if (amount >= 1000000000) {
			return `${(amount / 1000000000).toFixed(1)}B`;
		} else if (amount >= 1000000) {
			return `${(amount / 1000000).toFixed(1)}M`;
		} else if (amount >= 1000) {
			return `${(amount / 1000).toFixed(0)}K`;
		}
		return amount.toString();
	}
	
	function formatDate(date: Date): string {
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		
		if (date.toDateString() === today.toDateString()) return 'Today';
		if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
		
		return new Intl.DateTimeFormat('id-ID', {
			month: 'short',
			day: 'numeric'
		}).format(date);
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
	<div class="container mx-auto p-6 lg:p-8 space-y-8">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
				<p class="text-muted-foreground mt-2">
					Welcome back! Here's your financial overview
				</p>
			</div>
			<Button
				variant="ghost"
				size="icon"
				onclick={() => showBalances = !showBalances}
			>
				{#if showBalances}
					<EyeOff class="h-5 w-5" />
				{:else}
					<Eye class="h-5 w-5" />
				{/if}
			</Button>
		</div>
		
		<!-- Net Worth Hero Card -->
		<Card class="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
			<CardContent class="p-8">
				<div class="relative z-10">
					<div class="flex items-center justify-between mb-6">
						<div>
							<p class="text-blue-100 text-sm font-medium">NET WORTH</p>
							<p class="text-5xl font-bold mt-2">{formatCurrency(netWorthData.netWorth)}</p>
						</div>
						<div class="text-right">
							<p class="text-blue-100 text-sm">Monthly Savings</p>
							<p class="text-2xl font-semibold">{formatCurrency(monthlyData.net)}</p>
						</div>
					</div>
					
					<div class="grid grid-cols-3 gap-6">
						<div>
							<p class="text-blue-100 text-sm">Total Assets</p>
							<p class="text-xl font-semibold">{formatCurrency(netWorthData.assets.total)}</p>
						</div>
						<div>
							<p class="text-blue-100 text-sm">Total Liabilities</p>
							<p class="text-xl font-semibold">{formatCurrency(netWorthData.liabilities.total)}</p>
						</div>
						<div>
							<p class="text-blue-100 text-sm">Savings Rate</p>
							<p class="text-xl font-semibold">{monthlyData.savingsRate.toFixed(1)}%</p>
						</div>
					</div>
				</div>
				<!-- Background decoration -->
				<div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
				<div class="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
			</CardContent>
		</Card>
		
		<!-- Key Metrics -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">Monthly Income</CardTitle>
					<TrendingUp class="h-4 w-4 text-green-600" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{formatCurrency(monthlyData.income)}</div>
					<p class="text-xs text-muted-foreground mt-1">
						This month's earnings
					</p>
				</CardContent>
			</Card>
			
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">Monthly Expenses</CardTitle>
					<TrendingDown class="h-4 w-4 text-red-600" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{formatCurrency(monthlyData.expenses)}</div>
					<p class="text-xs text-muted-foreground mt-1">
						This month's spending
					</p>
				</CardContent>
			</Card>
			
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">Total Investments</CardTitle>
					<Wallet class="h-4 w-4 text-blue-600" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{formatCurrency(netWorthData.assets.investment)}</div>
					<p class="text-xs text-muted-foreground mt-1">
						Stocks, crypto & funds
					</p>
				</CardContent>
			</Card>
			
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">Liquid Assets</CardTitle>
					<PiggyBank class="h-4 w-4 text-green-600" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{formatCurrency(netWorthData.assets.liquid)}</div>
					<p class="text-xs text-muted-foreground mt-1">
						Cash & bank accounts
					</p>
				</CardContent>
			</Card>
		</div>
		
		<div class="grid gap-6 lg:grid-cols-3">
			<!-- Recent Transactions -->
			<Card class="lg:col-span-2">
				<CardHeader>
					<div class="flex items-center justify-between">
						<CardTitle>Recent Transactions</CardTitle>
						<Button variant="ghost" size="sm" href="/transactions">
							View All
							<ArrowUpRight class="ml-1 h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						{#each recentTransactions as transaction}
							<div class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
								<div class="flex items-center gap-3">
									<div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">
										{getCategoryIcon(transaction.type)}
									</div>
									<div>
										<p class="font-medium">{transaction.description}</p>
										<p class="text-sm text-muted-foreground">{formatDate(new Date(transaction.transactionDate))}</p>
									</div>
								</div>
								<div class="text-right">
									<p class="font-semibold {getCategoryColor(transaction.type)}">
										{transaction.type === 'expense' ? '-' : '+'}{formatCurrency(parseFloat(transaction.amount))}
									</p>
									<p class="text-xs text-muted-foreground">{transaction.account?.name || '-'}</p>
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
			
			<!-- Account Balances -->
			<Card>
				<CardHeader>
					<CardTitle>Account Balances</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						{#each accountBalances as account}
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="text-xl">{account.icon}</span>
										<span class="text-sm font-medium">{account.name}</span>
									</div>
									<span class="font-semibold {account.color}">
										{formatCurrency(Math.abs(account.amount))}
									</span>
								</div>
								{#if account.amount > 0}
									<Progress 
										value={(account.amount / netWorthData.assets.total) * 100} 
										class="h-2"
									/>
								{/if}
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		</div>
		
		<!-- Spending by Category -->
		<Card>
			<CardHeader>
				<CardTitle>Top Spending Categories</CardTitle>
				<CardDescription>This month's expense breakdown</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
					{#each topCategories as category}
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium">{category.label}</span>
								<span class="text-sm text-muted-foreground">
									{formatCompactCurrency(category.amount)}
								</span>
							</div>
							<Progress 
								value={(category.amount / monthlyData.expenses) * 100} 
								class="h-2"
							/>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>
		
		<!-- Quick Actions -->
		<div class="grid gap-4 md:grid-cols-4">
			<Button variant="outline" href="/transactions" class="h-auto p-4 justify-start">
				<Receipt class="mr-3 h-5 w-5" />
				<div class="text-left">
					<p class="font-semibold">Add Transaction</p>
					<p class="text-xs text-muted-foreground">Record income or expense</p>
				</div>
			</Button>
			
			<Button variant="outline" href="/assets/liquid" class="h-auto p-4 justify-start">
				<Wallet class="mr-3 h-5 w-5" />
				<div class="text-left">
					<p class="font-semibold">Manage Assets</p>
					<p class="text-xs text-muted-foreground">Update account balances</p>
				</div>
			</Button>
			
			<Button variant="outline" href="/debts" class="h-auto p-4 justify-start">
				<CreditCard class="mr-3 h-5 w-5" />
				<div class="text-left">
					<p class="font-semibold">Track Debts</p>
					<p class="text-xs text-muted-foreground">Manage loans & credit</p>
				</div>
			</Button>
			
			<Button variant="outline" href="/networth" class="h-auto p-4 justify-start">
				<TrendingUp class="mr-3 h-5 w-5" />
				<div class="text-left">
					<p class="font-semibold">View Net Worth</p>
					<p class="text-xs text-muted-foreground">Full financial picture</p>
				</div>
			</Button>
		</div>
	</div>
</div>