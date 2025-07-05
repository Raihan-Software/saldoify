<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Wallet } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { 
		mockLiquidAssets, 
		calculateTotalLiquidAssets, 
		liquidAssetTypes,
		type LiquidAsset 
	} from '$lib/modules/assets/liquid/liquid-assets-data';

	let assets = $state(mockLiquidAssets);
	let totalBalance = $derived(calculateTotalLiquidAssets(assets));
	let showAddModal = $state(false);
	
	// Form state
	let formData = $state({
		name: '',
		type: 'savings' as LiquidAsset['type'],
		institution: '',
		accountNumber: '',
		balance: '',
		notes: ''
	});
	
	// Calculate month-over-month change (mock data)
	const lastMonthTotal = 115000000; // Mock previous month total
	const monthlyChange = $derived(totalBalance - lastMonthTotal);
	const monthlyChangePercent = $derived(((monthlyChange / lastMonthTotal) * 100).toFixed(1));

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
			case 'cash': return 'default';
			case 'savings': return 'secondary';
			case 'checking': return 'outline';
			default: return 'default';
		}
	}
	
	function handleAddAsset() {
		if (!formData.name || !formData.balance) return;
		
		const newAsset: LiquidAsset = {
			id: Date.now().toString(),
			name: formData.name,
			type: formData.type,
			institution: formData.institution || undefined,
			accountNumber: formData.accountNumber || undefined,
			balance: parseFloat(formData.balance),
			currency: 'IDR',
			lastUpdated: new Date(),
			notes: formData.notes || undefined
		};
		
		assets = [...assets, newAsset];
		
		// Reset form
		formData = {
			name: '',
			type: 'savings',
			institution: '',
			accountNumber: '',
			balance: '',
			notes: ''
		};
		
		showAddModal = false;
	}
	
	function formatNumberInput(value: string): string {
		// Remove all non-digit characters
		const digits = value.replace(/\D/g, '');
		// Format with thousand separators
		return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	}
</script>

<div class="container mx-auto p-6 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Liquid Assets</h1>
			<p class="text-muted-foreground">Manage your cash and bank accounts</p>
		</div>
		<Button onclick={() => showAddModal = true}>
			<Plus class="mr-2 h-4 w-4" />
			Add Asset
		</Button>
	</div>

	<!-- Summary Cards -->
	<div class="grid gap-4 md:grid-cols-2">
		<!-- Total Balance Card -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Liquid Assets</CardTitle>
				<Wallet class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
				<p class="text-xs text-muted-foreground mt-1">
					Across {assets.length} accounts
				</p>
			</CardContent>
		</Card>

		<!-- Monthly Change Card -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Monthly Change</CardTitle>
				{#if monthlyChange >= 0}
					<TrendingUp class="h-4 w-4 text-green-600" />
				{:else}
					<TrendingDown class="h-4 w-4 text-red-600" />
				{/if}
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatCurrency(Math.abs(monthlyChange))}</div>
				<p class="text-xs {monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'} mt-1">
					{monthlyChange >= 0 ? '+' : ''}{monthlyChangePercent}% from last month
				</p>
			</CardContent>
		</Card>

	</div>

	<!-- Assets Table -->
	<Card class="mt-4">
		<CardHeader>
			<CardTitle>All Liquid Assets</CardTitle>
			<CardDescription>
				Click on any asset to view details or edit
			</CardDescription>
		</CardHeader>
		<CardContent>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Institution</TableHead>
						<TableHead>Account</TableHead>
						<TableHead class="text-right">Balance</TableHead>
						<TableHead>Last Updated</TableHead>
						<TableHead class="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each assets as asset}
						<TableRow>
							<TableCell class="font-medium">
								{asset.name}
								{#if asset.notes}
									<p class="text-xs text-muted-foreground">{asset.notes}</p>
								{/if}
							</TableCell>
							<TableCell>
								<Badge variant={getTypeVariant(asset.type)}>
									{liquidAssetTypes[asset.type].icon} {liquidAssetTypes[asset.type].label}
								</Badge>
							</TableCell>
							<TableCell>{asset.institution || '-'}</TableCell>
							<TableCell class="font-mono text-sm">{asset.accountNumber || '-'}</TableCell>
							<TableCell class="text-right font-medium">
								{formatCurrency(asset.balance)}
							</TableCell>
							<TableCell>{formatDate(asset.lastUpdated)}</TableCell>
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

<!-- Add Asset Modal -->
<Dialog.Root bind:open={showAddModal}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add New Liquid Asset</Dialog.Title>
			<Dialog.Description>
				Add a new cash or bank account to track your liquid assets.
			</Dialog.Description>
		</Dialog.Header>
		
		<form onsubmit={(e) => { e.preventDefault(); handleAddAsset(); }} class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Asset Name *</Label>
				<Input
					id="name"
					placeholder="e.g., BCA Savings"
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
					{#each Object.entries(liquidAssetTypes) as [value, { label, icon }]}
						<option {value}>{icon} {label}</option>
					{/each}
				</select>
			</div>
			
			<div class="space-y-2">
				<Label for="institution">Institution</Label>
				<Input
					id="institution"
					placeholder="e.g., Bank Central Asia"
					bind:value={formData.institution}
				/>
			</div>
			
			<div class="space-y-2">
				<Label for="accountNumber">Account Number</Label>
				<Input
					id="accountNumber"
					placeholder="e.g., ****1234"
					bind:value={formData.accountNumber}
				/>
			</div>
			
			<div class="space-y-2">
				<Label for="balance">Current Balance *</Label>
				<div class="relative">
					<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
					<Input
						id="balance"
						type="text"
						placeholder="0"
						class="pl-10"
						bind:value={formData.balance}
						oninput={(e) => {
							const target = e.currentTarget;
							const value = target.value;
							const formatted = formatNumberInput(value);
							formData.balance = value.replace(/\D/g, '');
							target.value = formatted;
						}}
						required
					/>
				</div>
			</div>
			
			<div class="space-y-2">
				<Label for="notes">Notes</Label>
				<Input
					id="notes"
					placeholder="Optional notes..."
					bind:value={formData.notes}
				/>
			</div>
			
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => showAddModal = false}>
					Cancel
				</Button>
				<Button type="submit">
					Add Asset
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>