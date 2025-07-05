<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { 
		calculateNetWorth,
		groupAssetsByCategory,
		groupLiabilitiesByType,
		liabilityTypes,
		mockLiabilities
	} from '$lib/modules/networth/networth-data';
	import { liquidAssetTypes } from '$lib/modules/assets/liquid/liquid-assets-data';
	import { nonLiquidAssetTypes } from '$lib/modules/assets/non-liquid/non-liquid-assets-data';
	import { investmentAssetTypes } from '$lib/modules/assets/investment/investment-assets-data';

	// Calculate net worth and get grouped data
	let netWorthData = $derived(calculateNetWorth());
	let groupedAssets = $derived(groupAssetsByCategory());
	let groupedLiabilities = $derived(groupLiabilitiesByType());

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatPercentage(value: number, total: number): string {
		if (total === 0) return '0%';
		return ((value / total) * 100).toFixed(1) + '%';
	}
</script>

<div class="container mx-auto p-6 space-y-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Net Worth</h1>
		<p class="text-muted-foreground mt-2">Your complete financial picture at a glance</p>
	</div>

	<!-- Hero Net Worth Card -->
	<Card class="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
		<CardContent class="p-8">
			<div class="relative z-10">
				<p class="text-sm opacity-90 mb-2">As of {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
				<p class="text-lg font-medium mb-4">Your Net Worth</p>
				<p class="text-5xl font-bold mb-8">{formatCurrency(netWorthData.netWorth)}</p>
				
				<div class="grid grid-cols-2 gap-8">
					<div>
						<p class="text-sm opacity-90 mb-1">Total Assets</p>
						<p class="text-2xl font-semibold">{formatCurrency(netWorthData.assets.total)}</p>
					</div>
					<div>
						<p class="text-sm opacity-90 mb-1">Total Liabilities</p>
						<p class="text-2xl font-semibold">{formatCurrency(netWorthData.liabilities.total)}</p>
					</div>
				</div>
			</div>
			<!-- Background decoration -->
			<div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
			<div class="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
		</CardContent>
	</Card>

	<!-- Quick Stats -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<Card class="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
			<CardContent class="p-6">
				<p class="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Liquid Assets</p>
				<p class="text-2xl font-bold text-green-800 dark:text-green-200">{formatCurrency(netWorthData.assets.liquid)}</p>
				<p class="text-xs text-green-600 dark:text-green-400 mt-1">
					{formatPercentage(netWorthData.assets.liquid, netWorthData.assets.total)} of assets
				</p>
			</CardContent>
		</Card>
		
		<Card class="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
			<CardContent class="p-6">
				<p class="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Investments</p>
				<p class="text-2xl font-bold text-blue-800 dark:text-blue-200">{formatCurrency(netWorthData.assets.investment)}</p>
				<p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
					{formatPercentage(netWorthData.assets.investment, netWorthData.assets.total)} of assets
				</p>
			</CardContent>
		</Card>
		
		<Card class="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
			<CardContent class="p-6">
				<p class="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Properties</p>
				<p class="text-2xl font-bold text-purple-800 dark:text-purple-200">{formatCurrency(netWorthData.assets.nonLiquid)}</p>
				<p class="text-xs text-purple-600 dark:text-purple-400 mt-1">
					{formatPercentage(netWorthData.assets.nonLiquid, netWorthData.assets.total)} of assets
				</p>
			</CardContent>
		</Card>
		
		<Card class="border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
			<CardContent class="p-6">
				<p class="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Debt Ratio</p>
				<p class="text-2xl font-bold text-amber-800 dark:text-amber-200">
					{((netWorthData.liabilities.total / netWorthData.assets.total) * 100).toFixed(1)}%
				</p>
				<p class="text-xs text-amber-600 dark:text-amber-400 mt-1">
					of assets
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Balance Sheet Style Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Assets Section -->
		<div class="space-y-6">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
					<span class="text-green-600 dark:text-green-400 font-bold">A</span>
				</div>
				<h2 class="text-2xl font-bold">Assets</h2>
			</div>
			
			<!-- Liquid Assets -->
			<Card class="border-l-4 border-l-green-500">
				<CardHeader class="pb-3">
					<div class="flex items-center justify-between">
						<div>
							<CardTitle class="text-lg flex items-center gap-2">
								💵 Liquid Assets
							</CardTitle>
							<CardDescription>Cash and easily accessible funds</CardDescription>
						</div>
						<span class="text-lg font-semibold text-green-600">
							{formatCurrency(netWorthData.assets.liquid)}
						</span>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						{#each groupedAssets.liquid as asset}
							<div class="flex justify-between items-center py-2 border-b last:border-0">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs">
										{liquidAssetTypes[asset.type]?.icon || '💰'}
									</div>
									<span class="font-medium">{asset.name}</span>
								</div>
								<div class="text-right">
									<p class="font-semibold">{formatCurrency(asset.balance)}</p>
									<p class="text-xs text-muted-foreground">
										{formatPercentage(asset.balance, netWorthData.assets.total)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>

			<!-- Investment Assets -->
			<Card class="border-l-4 border-l-blue-500">
				<CardHeader class="pb-3">
					<div class="flex items-center justify-between">
						<div>
							<CardTitle class="text-lg flex items-center gap-2">
								📈 Investments
							</CardTitle>
							<CardDescription>Stocks, crypto, and funds</CardDescription>
						</div>
						<span class="text-lg font-semibold text-blue-600">
							{formatCurrency(netWorthData.assets.investment)}
						</span>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						{#each groupedAssets.investment as asset}
							<div class="flex justify-between items-center py-2 border-b last:border-0">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs">
										{investmentAssetTypes[asset.type]?.icon || '💹'}
									</div>
									<div>
										<span class="font-medium">{asset.name}</span>
										{#if asset.ticker}
											<span class="text-xs text-muted-foreground ml-1">{asset.ticker}</span>
										{/if}
									</div>
								</div>
								<div class="text-right">
									<p class="font-semibold">{formatCurrency(asset.currentPrice * asset.quantity)}</p>
									<p class="text-xs text-muted-foreground">
										{formatPercentage(asset.currentPrice * asset.quantity, netWorthData.assets.total)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>

			<!-- Non-Liquid Assets -->
			<Card class="border-l-4 border-l-purple-500">
				<CardHeader class="pb-3">
					<div class="flex items-center justify-between">
						<div>
							<CardTitle class="text-lg flex items-center gap-2">
								🏠 Properties & Assets
							</CardTitle>
							<CardDescription>Real estate, vehicles, valuables</CardDescription>
						</div>
						<span class="text-lg font-semibold text-purple-600">
							{formatCurrency(netWorthData.assets.nonLiquid)}
						</span>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						{#each groupedAssets.nonLiquid as asset}
							<div class="flex justify-between items-center py-2 border-b last:border-0">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs">
										{nonLiquidAssetTypes[asset.type]?.icon || '🏢'}
									</div>
									<span class="font-medium">{asset.name}</span>
								</div>
								<div class="text-right">
									<p class="font-semibold">{formatCurrency(asset.currentValue)}</p>
									<p class="text-xs text-muted-foreground">
										{formatPercentage(asset.currentValue, netWorthData.assets.total)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>

		</div>

		<!-- Liabilities Section -->
		<div class="space-y-6">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
					<span class="text-red-600 dark:text-red-400 font-bold">L</span>
				</div>
				<h2 class="text-2xl font-bold">Liabilities</h2>
			</div>
			
			<!-- All Liabilities -->
			<Card class="border-l-4 border-l-red-500">
				<CardHeader class="pb-3">
					<div class="flex items-center justify-between">
						<div>
							<CardTitle class="text-lg flex items-center gap-2">
								💳 Outstanding Debts
							</CardTitle>
							<CardDescription>Loans, mortgages, and credit</CardDescription>
						</div>
						<span class="text-lg font-semibold text-red-600">
							{formatCurrency(netWorthData.liabilities.total)}
						</span>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						{#each mockLiabilities as liability}
							<div class="flex justify-between items-center py-3 border-b last:border-0">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs">
										{liabilityTypes[liability.type]?.icon || '💸'}
									</div>
									<div>
										<p class="font-medium">{liability.name}</p>
										{#if liability.interestRate}
											<p class="text-xs text-muted-foreground">
												{liability.interestRate}% APR
												{#if liability.monthlyPayment}
													• {formatCurrency(liability.monthlyPayment)}/mo
												{/if}
											</p>
										{/if}
									</div>
								</div>
								<div class="text-right">
									<p class="font-semibold text-red-600">{formatCurrency(liability.balance)}</p>
									<p class="text-xs text-muted-foreground">
										{formatPercentage(liability.balance, netWorthData.liabilities.total)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</div>