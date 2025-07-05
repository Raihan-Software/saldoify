<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Edit, Trash2, TrendingUp, TrendingDown, PieChart, ArrowUpRight, ArrowDownRight } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { 
		mockInvestmentAssets, 
		calculateTotalInvestmentAssets,
		calculateAssetGainLoss,
		investmentAssetTypes,
		type InvestmentAsset 
	} from '$lib/modules/assets/investment/investment-assets-data';

	let assets = $state(mockInvestmentAssets);
	let showAddModal = $state(false);
	
	// Calculate totals
	let totals = $derived(calculateTotalInvestmentAssets(assets));
	
	// Form state
	let formData = $state({
		name: '',
		type: 'stocks' as InvestmentAsset['type'],
		ticker: '',
		quantity: '',
		purchasePrice: '',
		currentPrice: '',
		purchaseDate: '',
		notes: ''
	});
	
	// Calculate total values for form
	let formTotalInvested = $derived(() => {
		if (formData.quantity && formData.purchasePrice) {
			return parseFloat(formData.quantity) * parseFloat(formData.purchasePrice);
		}
		return 0;
	});
	
	let formCurrentValue = $derived(() => {
		if (formData.quantity && formData.currentPrice) {
			return parseFloat(formData.quantity) * parseFloat(formData.currentPrice);
		}
		return 0;
	});
	
	let formGainLoss = $derived(formCurrentValue() - formTotalInvested());
	let formGainLossPercent = $derived(() => {
		if (formTotalInvested() > 0) {
			return (formGainLoss / formTotalInvested()) * 100;
		}
		return 0;
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(date);
	}

	function getTypeVariant(type: string): "default" | "secondary" | "outline" {
		switch (type) {
			case 'stocks': return 'default';
			case 'crypto': return 'secondary';
			case 'mutual-funds': return 'outline';
			default: return 'secondary';
		}
	}
	
	function handleAddAsset() {
		if (!formData.name || !formData.quantity || !formData.purchasePrice || !formData.currentPrice) return;
		
		const newAsset: InvestmentAsset = {
			id: Date.now().toString(),
			name: formData.name,
			type: formData.type,
			ticker: formData.ticker || undefined,
			quantity: parseFloat(formData.quantity),
			purchasePrice: parseFloat(formData.purchasePrice),
			currentPrice: parseFloat(formData.currentPrice),
			purchaseDate: new Date(formData.purchaseDate),
			currency: 'IDR',
			notes: formData.notes || undefined
		};
		
		assets = [...assets, newAsset];
		
		// Reset form
		formData = {
			name: '',
			type: 'stocks',
			ticker: '',
			quantity: '',
			purchasePrice: '',
			currentPrice: '',
			purchaseDate: '',
			notes: ''
		};
		
		showAddModal = false;
	}
	
	function formatNumberInput(value: string): string {
		const digits = value.replace(/\D/g, '');
		return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	}
	
	function formatDecimalInput(value: string): string {
		// Allow digits and decimal point
		const cleaned = value.replace(/[^\d.]/g, '');
		// Ensure only one decimal point
		const parts = cleaned.split('.');
		if (parts.length > 2) {
			return parts[0] + '.' + parts.slice(1).join('');
		}
		return cleaned;
	}
	
</script>

<div class="p-8 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Investment Assets</h1>
			<p class="text-muted-foreground">Manage your stocks, crypto, and other investments</p>
		</div>
		<Button onclick={() => showAddModal = true}>
			<Plus class="mr-2 h-4 w-4" />
			Add Investment
		</Button>
	</div>

	<!-- Summary Cards -->
	<div class="grid gap-4 md:grid-cols-3">
		<!-- Total Portfolio Value Card -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Portfolio Value</CardTitle>
				<PieChart class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatCurrency(totals.totalCurrentValue)}</div>
				<p class="text-xs text-muted-foreground mt-1">
					Across {assets.length} investments
				</p>
			</CardContent>
		</Card>

		<!-- Total Gain/Loss Card -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Gain/Loss</CardTitle>
				{#if totals.totalGainLoss >= 0}
					<ArrowUpRight class="h-4 w-4 text-green-600" />
				{:else}
					<ArrowDownRight class="h-4 w-4 text-red-600" />
				{/if}
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatCurrency(Math.abs(totals.totalGainLoss))}</div>
				<p class="text-xs {totals.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'} mt-1">
					{totals.totalGainLoss >= 0 ? '+' : ''}{totals.totalGainLossPercent.toFixed(1)}% return
				</p>
			</CardContent>
		</Card>

		<!-- Total Invested Card -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Invested</CardTitle>
				<TrendingUp class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatCurrency(totals.totalInvested)}</div>
				<p class="text-xs text-muted-foreground mt-1">
					Initial investment amount
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Assets Table -->
	<Card class="mt-4">
		<CardHeader>
			<CardTitle>All Investments</CardTitle>
			<CardDescription>
				Track performance of your investment portfolio
			</CardDescription>
		</CardHeader>
		<CardContent>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Ticker</TableHead>
						<TableHead class="text-right">Quantity</TableHead>
						<TableHead class="text-right">Avg. Price</TableHead>
						<TableHead class="text-right">Current Price</TableHead>
						<TableHead class="text-right">Current Value</TableHead>
						<TableHead class="text-right">Gain/Loss</TableHead>
						<TableHead class="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each assets as asset}
						{@const performance = calculateAssetGainLoss(asset)}
						<TableRow>
							<TableCell class="font-medium">
								{asset.name}
								{#if asset.notes}
									<p class="text-xs text-muted-foreground">{asset.notes}</p>
								{/if}
							</TableCell>
							<TableCell>
								<Badge variant={getTypeVariant(asset.type)}>
									{investmentAssetTypes[asset.type].icon} {investmentAssetTypes[asset.type].label}
								</Badge>
							</TableCell>
							<TableCell class="font-mono text-sm">{asset.ticker || '-'}</TableCell>
							<TableCell class="text-right">
								{asset.type === 'crypto' ? asset.quantity.toFixed(4) : asset.quantity.toLocaleString('id-ID')}
							</TableCell>
							<TableCell class="text-right">{formatCurrency(asset.purchasePrice)}</TableCell>
							<TableCell class="text-right">{formatCurrency(asset.currentPrice)}</TableCell>
							<TableCell class="text-right font-medium">{formatCurrency(performance.currentValue)}</TableCell>
							<TableCell class="text-right">
								<div class="flex flex-col items-end">
									<span class="text-sm font-medium {performance.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}">
										{performance.gainLoss >= 0 ? '+' : ''}{formatCurrency(performance.gainLoss)}
									</span>
									<span class="text-xs {performance.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}">
										{performance.gainLoss >= 0 ? '+' : ''}{performance.gainLossPercent.toFixed(1)}%
									</span>
								</div>
							</TableCell>
							<TableCell class="text-right">
								<div class="flex justify-end gap-2">
									<Button variant="ghost" size="icon">
										<Edit class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="icon">
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</CardContent>
	</Card>
</div>

<!-- Add Investment Modal -->
<Dialog.Root bind:open={showAddModal}>
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>Add New Investment</Dialog.Title>
			<Dialog.Description>
				Add stocks, cryptocurrency, or other investment assets to your portfolio.
			</Dialog.Description>
		</Dialog.Header>
		
		<form onsubmit={(e) => { e.preventDefault(); handleAddAsset(); }} class="space-y-6 max-h-[65vh] overflow-y-auto px-1">
			<!-- Basic Information Section -->
			<div class="space-y-4">
				<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Investment Details</h3>
				<div class="space-y-4 pl-1">
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="name">Investment Name *</Label>
							<Input
								id="name"
								placeholder="e.g., Bitcoin, BBCA"
								bind:value={formData.name}
								required
							/>
						</div>
						
						<div class="space-y-2">
							<Label for="type">Asset Type *</Label>
							<select
								id="type"
								bind:value={formData.type}
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								{#each Object.entries(investmentAssetTypes) as [value, { label, icon }]}
									<option {value}>{icon} {label}</option>
								{/each}
							</select>
						</div>
					</div>
					
					<div class="space-y-2">
						<Label for="ticker">Ticker Symbol</Label>
						<Input
								id="ticker"
							placeholder="e.g., BTC, BBCA"
							bind:value={formData.ticker}
							class="uppercase"
						/>
					</div>
				</div>
			</div>
			
			<!-- Purchase Information Section -->
			<div class="space-y-4">
				<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Purchase Information</h3>
				<div class="space-y-4 pl-1">
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="quantity">Quantity *</Label>
							<Input
								id="quantity"
								type="text"
								placeholder="e.g., 100, 0.15"
								bind:value={formData.quantity}
								oninput={(e) => {
									const target = e.currentTarget;
									formData.quantity = formatDecimalInput(target.value);
								}}
								required
							/>
							<p class="text-xs text-muted-foreground">Number of shares/units</p>
						</div>
						
						<div class="space-y-2">
							<Label for="purchaseDate">Purchase Date *</Label>
							<Input
								id="purchaseDate"
								type="date"
								bind:value={formData.purchaseDate}
								required
							/>
						</div>
					</div>
					
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="purchasePrice">Purchase Price per Unit *</Label>
							<div class="relative">
								<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
								<Input
									id="purchasePrice"
									type="text"
									placeholder="0"
									class="pl-10"
									bind:value={formData.purchasePrice}
									oninput={(e) => {
										const target = e.currentTarget;
										const value = target.value;
										const formatted = formatNumberInput(value);
										formData.purchasePrice = value.replace(/\D/g, '');
										target.value = formatted;
									}}
									required
								/>
							</div>
						</div>
						
						<div class="space-y-2">
							<Label>Total Invested</Label>
							<div class="h-10 px-3 py-2 text-sm bg-muted rounded-md flex items-center">
								{formTotalInvested() > 0 ? formatCurrency(formTotalInvested()) : '-'}
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Current Value Section -->
			<div class="space-y-4">
				<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Value</h3>
				<div class="space-y-4 pl-1">
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="currentPrice">Current Price per Unit *</Label>
							<div class="relative">
								<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
								<Input
									id="currentPrice"
									type="text"
									placeholder="0"
									class="pl-10"
									bind:value={formData.currentPrice}
									oninput={(e) => {
										const target = e.currentTarget;
										const value = target.value;
										const formatted = formatNumberInput(value);
										formData.currentPrice = value.replace(/\D/g, '');
										target.value = formatted;
									}}
									required
								/>
							</div>
						</div>
						
						<div class="space-y-2">
							<Label>Current Total Value</Label>
							<div class="h-10 px-3 py-2 text-sm bg-muted rounded-md flex items-center">
								{formCurrentValue() > 0 ? formatCurrency(formCurrentValue()) : '-'}
							</div>
						</div>
					</div>
					
					{#if formTotalInvested() > 0 && formCurrentValue() > 0}
						<div class="rounded-lg bg-muted/50 p-4 space-y-2">
							<div class="flex justify-between items-center">
								<span class="text-sm font-medium">Unrealized Gain/Loss</span>
								<span class="text-sm font-bold {formGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}">
									{formGainLoss >= 0 ? '+' : ''}{formatCurrency(formGainLoss)}
								</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-sm font-medium">Return</span>
								<Badge class={formGainLoss >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} variant="secondary">
									{formGainLoss >= 0 ? '+' : ''}{formGainLossPercent().toFixed(1)}%
								</Badge>
							</div>
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Additional Information Section -->
			<div class="space-y-4">
				<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Additional Information</h3>
				<div class="space-y-4 pl-1">
					<div class="space-y-2">
						<Label for="notes">Notes</Label>
						<textarea
							id="notes"
							placeholder="Investment strategy, target price, etc..."
							bind:value={formData.notes}
							class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						/>
					</div>
				</div>
			</div>
			
			<Dialog.Footer class="sticky bottom-0 bg-background pt-4 border-t">
				<Button type="button" variant="outline" onclick={() => showAddModal = false}>
					Cancel
				</Button>
				<Button type="submit">
					Add Investment
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>