<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Edit, Trash2, TrendingUp, TrendingDown, LineChart, Calendar, Hash, BarChart3 } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import PageHeader from '$lib/components/page-header.svelte';
	import type { PageData, ActionData } from './$types';
	
	let { data, form }: { data: PageData; form: ActionData } = $props();
	
	// Modal states
	let showAddModal = $state(false);
	let showEditModal = $state(false);
	let editingAsset = $state<any>(null);
	
	// Form state
	let formData = $state({
		assetTypeId: '',
		name: '',
		description: '',
		currentValue: '',
		purchaseValue: '',
		purchaseDate: '',
		ticker: '',
		shares: '',
		notes: ''
	});
	
	// Format currency for display
	function displayCurrency(value: string | number) {
		const amount = typeof value === 'string' ? parseFloat(value) : value;
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: data.preferences?.currencyCode || 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		});
		
		if (data.preferences?.currencyDisplay === 'code') {
			return formatter.format(amount).replace(/[A-Z]{3}/, data.preferences.currencyCode);
		}
		
		return formatter.format(amount);
	}
	
	// Format date for display
	function displayDate(dateString: string | Date | null) {
		if (!dateString) return '-';
		const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(date);
	}
	
	// Format number
	function formatNumber(value: string | number | null) {
		if (!value) return '-';
		const num = typeof value === 'string' ? parseFloat(value) : value;
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 4
		}).format(num);
	}
	
	// Edit asset
	function startEdit(asset: any) {
		editingAsset = asset;
		showEditModal = true;
	}
	
	// Reset form
	function resetForm() {
		formData = {
			assetTypeId: '',
			name: '',
			description: '',
			currentValue: '',
			purchaseValue: '',
			purchaseDate: '',
			ticker: '',
			shares: '',
			notes: ''
		};
	}
	
	// Calculate returns
	function calculateReturns(currentValue: string, purchaseValue: string | null) {
		if (!purchaseValue) return null;
		const current = parseFloat(currentValue);
		const purchase = parseFloat(purchaseValue);
		if (purchase === 0) return null;
		return ((current - purchase) / purchase) * 100;
	}
	
	// Calculate price per share
	function calculatePricePerShare(value: string, shares: string | null) {
		if (!shares || parseFloat(shares) === 0) return null;
		return parseFloat(value) / parseFloat(shares);
	}
</script>

<div class="p-8 space-y-6">

	<!-- Header -->
	<PageHeader 
		title="Investments"
		description="Track your investment portfolio and performance"
		actionLabel="Add Investment"
		onAction={() => showAddModal = true}
	/>

	<!-- Summary Cards -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card class="border shadow-sm">
			<CardHeader class="pb-2">
				<div class="flex items-center justify-between">
					<CardDescription>Total Portfolio Value</CardDescription>
					<LineChart class="h-4 w-4 text-muted-foreground" />
				</div>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">{displayCurrency(data.summary.totalValue.toString())}</p>
			</CardContent>
		</Card>
		
		<Card class="border shadow-sm">
			<CardHeader class="pb-2">
				<div class="flex items-center justify-between">
					<CardDescription>Number of Investments</CardDescription>
					<BarChart3 class="h-4 w-4 text-muted-foreground" />
				</div>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">{data.summary.count}</p>
			</CardContent>
		</Card>
		
		<Card class="border shadow-sm">
			<CardHeader class="pb-2">
				<div class="flex items-center justify-between">
					<CardDescription>Total Returns</CardDescription>
					{#if data.summary.growth >= 0}
						<TrendingUp class="h-4 w-4 text-green-600" />
					{:else}
						<TrendingDown class="h-4 w-4 text-red-600" />
					{/if}
				</div>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold {data.summary.growth >= 0 ? 'text-green-600' : 'text-red-600'}">
					{data.summary.growth >= 0 ? '+' : ''}{data.summary.growth.toFixed(2)}%
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Investments Table -->
	<Card class="border shadow-sm">
		<CardHeader>
			<CardTitle>Your Investment Portfolio</CardTitle>
			<CardDescription>Stocks, bonds, mutual funds, and other investments</CardDescription>
		</CardHeader>
		<CardContent>
			{#if data.assets.length === 0}
				<div class="text-center py-12">
					<LineChart class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
					<h3 class="text-lg font-semibold mb-2">No investments yet</h3>
					<p class="text-muted-foreground mb-4">Add your first investment to start tracking your portfolio</p>
					<Button onclick={() => showAddModal = true}>
						<Plus class="mr-2 h-4 w-4" />
						Add Investment
					</Button>
				</div>
			{:else}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Ticker</TableHead>
							<TableHead class="text-right">Shares</TableHead>
							<TableHead class="text-right">Cost Basis</TableHead>
							<TableHead class="text-right">Current Value</TableHead>
							<TableHead class="text-right">Price/Share</TableHead>
							<TableHead class="text-center">Returns</TableHead>
							<TableHead class="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each data.assets as asset}
							{@const returns = calculateReturns(asset.currentValue, asset.purchaseValue)}
							{@const pricePerShare = calculatePricePerShare(asset.currentValue, asset.shares)}
							<TableRow>
								<TableCell>
									<div>
										<p class="font-medium">{asset.name}</p>
										{#if asset.description}
											<p class="text-sm text-muted-foreground">{asset.description}</p>
										{/if}
									</div>
								</TableCell>
								<TableCell>
									<div class="flex items-center gap-2">
										<span class="text-xl">{asset.assetType?.icon}</span>
										<span>{asset.assetType?.label}</span>
									</div>
								</TableCell>
								<TableCell>
									{#if asset.ticker}
										<Badge variant="outline" class="font-mono">
											{asset.ticker}
										</Badge>
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</TableCell>
								<TableCell class="text-right">
									{#if asset.shares}
										<div class="flex items-center justify-end gap-1">
											<Hash class="h-3 w-3 text-muted-foreground" />
											<span>{formatNumber(asset.shares)}</span>
										</div>
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</TableCell>
								<TableCell class="text-right">
									{#if asset.purchaseValue}
										{displayCurrency(asset.purchaseValue)}
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</TableCell>
								<TableCell class="text-right font-medium">
									{displayCurrency(asset.currentValue)}
								</TableCell>
								<TableCell class="text-right">
									{#if pricePerShare}
										{displayCurrency(pricePerShare)}
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</TableCell>
								<TableCell class="text-center">
									{#if returns !== null}
										<Badge variant={returns >= 0 ? 'default' : 'destructive'}>
											{returns >= 0 ? '+' : ''}{returns.toFixed(2)}%
										</Badge>
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</TableCell>
								<TableCell class="text-right">
									<div class="flex items-center justify-end gap-2">
										<Button size="icon" variant="ghost" onclick={() => startEdit(asset)}>
											<Edit class="h-4 w-4" />
										</Button>
										<form 
											method="POST" 
											action="?/delete"
											use:enhance={() => {
												return async ({ update }) => {
													if (confirm('Are you sure you want to delete this investment?')) {
														await update();
													}
												};
											}}
											class="inline"
										>
											<input type="hidden" name="id" value={asset.id} />
											<Button type="submit" size="icon" variant="ghost">
												<Trash2 class="h-4 w-4" />
											</Button>
										</form>
									</div>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{/if}
		</CardContent>
	</Card>
</div>

<!-- Add Investment Modal -->
<Dialog.Root bind:open={showAddModal}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Add Investment</Dialog.Title>
			<Dialog.Description>Add a new investment to your portfolio</Dialog.Description>
		</Dialog.Header>
		<form 
			method="POST" 
			action="?/create"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						showAddModal = false;
						resetForm();
						await update();
					} else {
						await update();
					}
				};
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="assetTypeId">Investment Type</Label>
				<select
					id="assetTypeId"
					name="assetTypeId"
					bind:value={formData.assetTypeId}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					required
				>
					<option value="">Select investment type</option>
					{#each data.investmentAssetTypes as type}
						<option value={type.id}>
							{type.icon} {type.label}
						</option>
					{/each}
				</select>
			</div>
			
			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input
					id="name"
					name="name"
					placeholder="e.g., Apple Inc."
					bind:value={formData.name}
					required
				/>
			</div>
			
			<div class="space-y-2">
				<Label for="description">Description (Optional)</Label>
				<Input
					id="description"
					name="description"
					placeholder="e.g., Technology stock"
					bind:value={formData.description}
				/>
			</div>
			
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="ticker">Ticker Symbol (Optional)</Label>
					<Input
						id="ticker"
						name="ticker"
						placeholder="e.g., AAPL"
						bind:value={formData.ticker}
						class="uppercase"
					/>
				</div>
				
				<div class="space-y-2">
					<Label for="shares">Number of Shares (Optional)</Label>
					<Input
						id="shares"
						name="shares"
						type="number"
						step="0.0001"
						placeholder="0"
						bind:value={formData.shares}
					/>
				</div>
			</div>
			
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="purchaseDate">Purchase Date (Optional)</Label>
					<Input
						id="purchaseDate"
						name="purchaseDate"
						type="date"
						bind:value={formData.purchaseDate}
					/>
				</div>
				
				<div class="space-y-2">
					<Label for="purchaseValue">Cost Basis (Optional)</Label>
					<Input
						id="purchaseValue"
						name="purchaseValue"
						type="number"
						step="0.01"
						placeholder="0.00"
						bind:value={formData.purchaseValue}
					/>
				</div>
			</div>
			
			<div class="space-y-2">
				<Label for="currentValue">Current Value</Label>
				<Input
					id="currentValue"
					name="currentValue"
					type="number"
					step="0.01"
					placeholder="0.00"
					bind:value={formData.currentValue}
					required
				/>
			</div>
			
			<div class="space-y-2">
				<Label for="notes">Notes (Optional)</Label>
				<Textarea
					id="notes"
					name="notes"
					placeholder="Any additional notes"
					bind:value={formData.notes}
					class="min-h-[80px]"
				/>
			</div>
			
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => showAddModal = false}>
					Cancel
				</Button>
				<Button type="submit">Add Investment</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Investment Modal -->
<Dialog.Root bind:open={showEditModal}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit Investment</Dialog.Title>
			<Dialog.Description>Update your investment information</Dialog.Description>
		</Dialog.Header>
		{#if editingAsset}
			<form 
				method="POST" 
				action="?/update"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							showEditModal = false;
							editingAsset = null;
							await update();
						} else {
							await update();
						}
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="id" value={editingAsset.id} />
				
				<div class="space-y-2">
					<Label>Investment Type</Label>
					<div class="flex items-center gap-2 p-3 bg-muted rounded-md">
						<span class="text-xl">{editingAsset.assetType?.icon}</span>
						<span>{editingAsset.assetType?.label}</span>
					</div>
				</div>
				
				<div class="space-y-2">
					<Label for="edit-name">Name</Label>
					<Input
						id="edit-name"
						name="name"
						value={editingAsset.name}
						required
					/>
				</div>
				
				<div class="space-y-2">
					<Label for="edit-description">Description (Optional)</Label>
					<Input
						id="edit-description"
						name="description"
						value={editingAsset.description || ''}
					/>
				</div>
				
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="edit-ticker">Ticker Symbol (Optional)</Label>
						<Input
							id="edit-ticker"
							name="ticker"
							value={editingAsset.ticker || ''}
							class="uppercase"
						/>
					</div>
					
					<div class="space-y-2">
						<Label for="edit-shares">Number of Shares (Optional)</Label>
						<Input
							id="edit-shares"
							name="shares"
							type="number"
							step="0.0001"
							value={editingAsset.shares || ''}
						/>
					</div>
				</div>
				
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="edit-purchaseDate">Purchase Date (Optional)</Label>
						<Input
							id="edit-purchaseDate"
							name="purchaseDate"
							type="date"
							value={editingAsset.purchaseDate ? new Date(editingAsset.purchaseDate).toISOString().split('T')[0] : ''}
						/>
					</div>
					
					<div class="space-y-2">
						<Label for="edit-purchaseValue">Cost Basis (Optional)</Label>
						<Input
							id="edit-purchaseValue"
							name="purchaseValue"
							type="number"
							step="0.01"
							value={editingAsset.purchaseValue || ''}
						/>
					</div>
				</div>
				
				<div class="space-y-2">
					<Label for="edit-currentValue">Current Value</Label>
					<Input
						id="edit-currentValue"
						name="currentValue"
						type="number"
						step="0.01"
						value={editingAsset.currentValue}
						required
					/>
				</div>
				
				<div class="space-y-2">
					<Label for="edit-notes">Notes (Optional)</Label>
					<Textarea
						id="edit-notes"
						name="notes"
						value={editingAsset.notes || ''}
						class="min-h-[80px]"
					/>
				</div>
				
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => { showEditModal = false; editingAsset = null; }}>
						Cancel
					</Button>
					<Button type="submit">Update Investment</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>