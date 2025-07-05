<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Package, ArrowUpRight, ArrowDownRight } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { 
		mockNonLiquidAssets, 
		calculateTotalNonLiquidAssets, 
		nonLiquidAssetTypes,
		type NonLiquidAsset 
	} from '$lib/modules/assets/non-liquid/non-liquid-assets-data';

	let assets = $state(mockNonLiquidAssets);
	let showAddModal = $state(false);
	
	// Calculate totals
	let totals = $derived(calculateTotalNonLiquidAssets(assets));
	
	// Form state
	let formData = $state({
		name: '',
		type: 'electronics' as NonLiquidAsset['type'],
		category: '',
		purchasePrice: '',
		currentValue: '',
		purchaseDate: '',
		location: '',
		notes: '',
		usefulLife: '',
		depreciationRate: ''
	});
	
	// Calculate depreciation when purchase price and useful life change
	let annualDepreciation = $derived(() => {
		if (formData.purchasePrice && formData.usefulLife) {
			const price = parseFloat(formData.purchasePrice);
			const years = parseFloat(formData.usefulLife);
			return price / years;
		}
		return 0;
	});
	
	let monthlyDepreciation = $derived(annualDepreciation() / 12);
	
	// Auto-calculate current value based on depreciation
	function calculateDepreciatedValue() {
		if (formData.purchasePrice && formData.purchaseDate && formData.usefulLife) {
			const price = parseFloat(formData.purchasePrice);
			const purchaseDate = new Date(formData.purchaseDate);
			const now = new Date();
			const monthsElapsed = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + 
				(now.getMonth() - purchaseDate.getMonth());
			const depreciated = Math.max(0, price - (monthlyDepreciation * monthsElapsed));
			formData.currentValue = depreciated.toString();
		}
	}
	

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
			case 'property': return 'default';
			case 'vehicle': return 'secondary';
			case 'electronics': return 'outline';
			default: return 'secondary';
		}
	}
	
	
	function handleAddAsset() {
		if (!formData.name || !formData.purchasePrice || !formData.currentValue) return;
		
		const newAsset: NonLiquidAsset = {
			id: Date.now().toString(),
			name: formData.name,
			type: formData.type,
			category: formData.category || undefined,
			purchasePrice: parseFloat(formData.purchasePrice),
			currentValue: parseFloat(formData.currentValue),
			purchaseDate: new Date(formData.purchaseDate),
			currency: 'IDR',
			location: formData.location || undefined,
			notes: formData.notes || undefined,
			depreciationRate: formData.usefulLife ? (100 / parseFloat(formData.usefulLife)) : undefined
		};
		
		assets = [...assets, newAsset];
		
		// Reset form
		formData = {
			name: '',
			type: 'electronics',
			category: '',
			purchasePrice: '',
			currentValue: '',
			purchaseDate: '',
			location: '',
			notes: '',
			usefulLife: '',
			depreciationRate: ''
		};
		
		showAddModal = false;
	}
	
	function formatNumberInput(value: string): string {
		const digits = value.replace(/\D/g, '');
		return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	}
	
	function getAppreciationBadge(asset: NonLiquidAsset) {
		const appreciation = asset.currentValue - asset.purchasePrice;
		const appreciationPercent = ((appreciation / asset.purchasePrice) * 100).toFixed(1);
		
		if (appreciation > 0) {
			return { text: `+${appreciationPercent}%`, class: 'text-green-600 bg-green-50' };
		} else if (appreciation < 0) {
			return { text: `${appreciationPercent}%`, class: 'text-red-600 bg-red-50' };
		}
		return { text: '0%', class: 'text-gray-600 bg-gray-50' };
	}
</script>

<div class="p-8 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Non-Liquid Assets</h1>
			<p class="text-muted-foreground">Manage your properties, vehicles, and valuables</p>
		</div>
		<Button onclick={() => showAddModal = true}>
			<Plus class="mr-2 h-4 w-4" />
			Add Asset
		</Button>
	</div>

	<!-- Summary Cards -->
	<div class="grid gap-4 md:grid-cols-2">
		<!-- Total Current Value Card -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Current Value</CardTitle>
				<Package class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatCurrency(totals.totalCurrentValue)}</div>
				<p class="text-xs text-muted-foreground mt-1">
					Across {assets.length} assets
				</p>
			</CardContent>
		</Card>

		<!-- Total Appreciation Card -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Appreciation</CardTitle>
				{#if totals.totalAppreciation >= 0}
					<ArrowUpRight class="h-4 w-4 text-green-600" />
				{:else}
					<ArrowDownRight class="h-4 w-4 text-red-600" />
				{/if}
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatCurrency(Math.abs(totals.totalAppreciation))}</div>
				<p class="text-xs {totals.totalAppreciation >= 0 ? 'text-green-600' : 'text-red-600'} mt-1">
					{totals.totalAppreciation >= 0 ? '+' : ''}{totals.appreciationPercent.toFixed(1)}% overall
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Assets Table -->
	<Card class="mt-4">
		<CardHeader>
			<CardTitle>All Non-Liquid Assets</CardTitle>
			<CardDescription>
				Track depreciation and appreciation of your valuable assets
			</CardDescription>
		</CardHeader>
		<CardContent>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Purchase Price</TableHead>
						<TableHead>Current Value</TableHead>
						<TableHead>Appreciation</TableHead>
						<TableHead>Purchase Date</TableHead>
						<TableHead class="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each assets as asset}
						{@const appreciation = getAppreciationBadge(asset)}
						<TableRow>
							<TableCell class="font-medium">
								{asset.name}
								{#if asset.notes}
									<p class="text-xs text-muted-foreground">{asset.notes}</p>
								{/if}
							</TableCell>
							<TableCell>
								<Badge variant={getTypeVariant(asset.type)}>
									{nonLiquidAssetTypes[asset.type].icon} {nonLiquidAssetTypes[asset.type].label}
								</Badge>
							</TableCell>
							<TableCell>{asset.category || '-'}</TableCell>
							<TableCell>{formatCurrency(asset.purchasePrice)}</TableCell>
							<TableCell class="font-medium">{formatCurrency(asset.currentValue)}</TableCell>
							<TableCell>
								<Badge class={appreciation.class} variant="secondary">
									{appreciation.text}
								</Badge>
							</TableCell>
							<TableCell>{formatDate(asset.purchaseDate)}</TableCell>
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
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>Add New Non-Liquid Asset</Dialog.Title>
			<Dialog.Description>
				Add a property, vehicle, or valuable item to track its value over time.
			</Dialog.Description>
		</Dialog.Header>
		
		<form onsubmit={(e) => { e.preventDefault(); handleAddAsset(); }} class="space-y-6 max-h-[65vh] overflow-y-auto px-1">
			<!-- Basic Information Section -->
			<div class="space-y-4">
				<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h3>
				<div class="space-y-4 pl-1">
					<div class="space-y-2">
						<Label for="name">Asset Name *</Label>
						<Input
							id="name"
							placeholder="e.g., MacBook Pro M2"
							bind:value={formData.name}
							required
						/>
					</div>
					
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="type">Asset Type *</Label>
							<select
								id="type"
								bind:value={formData.type}
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								{#each Object.entries(nonLiquidAssetTypes) as [value, { label, icon }]}
									<option {value}>{icon} {label}</option>
								{/each}
							</select>
						</div>
						
						<div class="space-y-2">
							<Label for="category">Category</Label>
							<Input
								id="category"
								placeholder="e.g., Computer"
								bind:value={formData.category}
							/>
						</div>
					</div>
					
					<div class="space-y-2">
						<Label for="location">Location</Label>
						<Input
							id="location"
							placeholder="e.g., Jakarta, Home Office"
							bind:value={formData.location}
						/>
					</div>
				</div>
			</div>
			
			<!-- Value & Depreciation Section -->
			<div class="space-y-4">
				<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Value & Depreciation</h3>
				<div class="space-y-4 pl-1">
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="purchasePrice">Purchase Price *</Label>
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
										calculateDepreciatedValue();
									}}
									required
								/>
							</div>
						</div>
						
						<div class="space-y-2">
							<Label for="purchaseDate">Purchase Date *</Label>
							<Input
								id="purchaseDate"
								type="date"
								bind:value={formData.purchaseDate}
								onchange={calculateDepreciatedValue}
								required
							/>
						</div>
					</div>
					
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="usefulLife">Masa Manfaat (Years)</Label>
							<Input
								id="usefulLife"
								type="number"
								placeholder="e.g., 5"
								min="1"
								bind:value={formData.usefulLife}
								onchange={calculateDepreciatedValue}
							/>
							<p class="text-xs text-muted-foreground">Useful life for depreciation</p>
						</div>
						
						<div class="space-y-2">
							<Label>Annual Depreciation</Label>
							<div class="h-10 px-3 py-2 text-sm bg-muted rounded-md flex items-center">
								{annualDepreciation() > 0 ? formatCurrency(annualDepreciation()) : '-'}
							</div>
							<p class="text-xs text-muted-foreground">Straight-line method</p>
						</div>
					</div>
					
					<div class="space-y-2">
						<Label for="currentValue">Current Value *</Label>
						<div class="relative">
							<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
							<Input
								id="currentValue"
								type="text"
								placeholder="0"
								class="pl-10"
								bind:value={formData.currentValue}
								oninput={(e) => {
									const target = e.currentTarget;
									const value = target.value;
									const formatted = formatNumberInput(value);
									formData.currentValue = value.replace(/\D/g, '');
									target.value = formatted;
								}}
								required
							/>
						</div>
						{#if formData.usefulLife && formData.purchasePrice && formData.purchaseDate}
							<p class="text-xs text-muted-foreground">
								Auto-calculated based on depreciation. You can override if needed.
							</p>
						{/if}
					</div>
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
							placeholder="Additional details about the asset..."
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
					Add Asset
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>