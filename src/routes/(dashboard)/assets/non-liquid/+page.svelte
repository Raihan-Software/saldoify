<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Home, Calendar, MapPin, Package, TrendingDownIcon } from '@lucide/svelte';
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
		location: '',
		quantity: '1',
		notes: '',
		depreciationType: 'none' as 'yearly' | 'monthly' | 'none',
		usageYears: ''
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
	
	// Edit asset
	function startEdit(asset: any) {
		editingAsset = asset;
		// Populate form data for edit
		formData = {
			assetTypeId: asset.assetTypeId || '',
			name: asset.name || '',
			description: asset.description || '',
			currentValue: asset.currentValue || '',
			purchaseValue: asset.purchaseValue || '',
			purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
			location: asset.location || '',
			quantity: asset.quantity?.toString() || '1',
			notes: asset.notes || '',
			depreciationType: 'none', // Will be populated from DB later
			usageYears: '' // Will be populated from DB later
		};
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
			location: '',
			quantity: '1',
			notes: '',
			depreciationType: 'none',
			usageYears: ''
		};
	}
	
	// Calculate appreciation
	function calculateAppreciation(currentValue: string, purchaseValue: string | null) {
		if (!purchaseValue) return null;
		const current = parseFloat(currentValue);
		const purchase = parseFloat(purchaseValue);
		if (purchase === 0) return null;
		return ((current - purchase) / purchase) * 100;
	}
	
	// Calculate depreciation
	function calculateDepreciation() {
		if (!formData.purchaseValue || !formData.usageYears || formData.depreciationType === 'none') {
			return { yearly: 0, monthly: 0, total: 0 };
		}
		
		const purchaseValue = parseFloat(formData.purchaseValue);
		const years = parseFloat(formData.usageYears);
		
		if (isNaN(purchaseValue) || isNaN(years) || years <= 0) {
			return { yearly: 0, monthly: 0, total: 0 };
		}
		
		const yearlyDepreciation = purchaseValue / years;
		const monthlyDepreciation = yearlyDepreciation / 12;
		const totalDepreciation = purchaseValue;
		
		return {
			yearly: yearlyDepreciation,
			monthly: monthlyDepreciation,
			total: totalDepreciation
		};
	}
	
	let depreciation = $derived(calculateDepreciation());
</script>

<div class="p-8 space-y-6">
	<!-- Header -->
	<PageHeader 
		title="Non-Liquid Assets"
		description="Manage your properties, vehicles, and other tangible assets"
		actionLabel="Add Non-Liquid Asset"
		onAction={() => showAddModal = true}
	/>

	<!-- Summary Cards -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card class="border shadow-sm">
			<CardHeader class="pb-2">
				<div class="flex items-center justify-between">
					<CardDescription>Total Value</CardDescription>
					<Home class="h-4 w-4 text-muted-foreground" />
				</div>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">{displayCurrency(data.summary.totalValue.toString())}</p>
			</CardContent>
		</Card>
		
		<Card class="border shadow-sm">
			<CardHeader class="pb-2">
				<div class="flex items-center justify-between">
					<CardDescription>Number of Assets</CardDescription>
					<Package class="h-4 w-4 text-muted-foreground" />
				</div>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">{data.summary.count}</p>
			</CardContent>
		</Card>
		
		<Card class="border shadow-sm">
			<CardHeader class="pb-2">
				<div class="flex items-center justify-between">
					<CardDescription>Average Appreciation</CardDescription>
					{#if data.summary.growth >= 0}
						<TrendingUp class="h-4 w-4 text-green-600" />
					{:else}
						<TrendingDown class="h-4 w-4 text-red-600" />
					{/if}
				</div>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold {data.summary.growth >= 0 ? 'text-green-600' : 'text-red-600'}">
					{data.summary.growth.toFixed(2)}%
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Assets Table -->
	<Card class="border shadow-sm">
		<CardHeader>
			<CardTitle>Your Non-Liquid Assets</CardTitle>
			<CardDescription>Properties, vehicles, and other tangible assets</CardDescription>
		</CardHeader>
		<CardContent>
			{#if data.assets.length === 0}
				<div class="text-center py-12">
					<Home class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
					<h3 class="text-lg font-semibold mb-2">No non-liquid assets yet</h3>
					<p class="text-muted-foreground mb-4">Add your first property or vehicle to get started</p>
					<Button onclick={() => showAddModal = true}>
						<Plus class="mr-2 h-4 w-4" />
						Add Non-Liquid Asset
					</Button>
				</div>
			{:else}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Location</TableHead>
							<TableHead>Purchase Date</TableHead>
							<TableHead class="text-center">Qty</TableHead>
							<TableHead class="text-right">Purchase Value</TableHead>
							<TableHead class="text-right">Current Value</TableHead>
							<TableHead class="text-center">Appreciation</TableHead>
							<TableHead class="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each data.assets as asset}
							{@const appreciation = calculateAppreciation(asset.currentValue, asset.purchaseValue)}
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
									{#if asset.location}
										<div class="flex items-center gap-1">
											<MapPin class="h-3 w-3 text-muted-foreground" />
											<span class="text-sm">{asset.location}</span>
										</div>
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</TableCell>
								<TableCell>
									{#if asset.purchaseDate}
										<div class="flex items-center gap-1">
											<Calendar class="h-3 w-3 text-muted-foreground" />
											<span class="text-sm">{displayDate(asset.purchaseDate)}</span>
										</div>
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</TableCell>
								<TableCell class="text-center">
									{asset.quantity || 1}
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
								<TableCell class="text-center">
									{#if appreciation !== null}
										<Badge variant={appreciation >= 0 ? 'default' : 'destructive'}>
											{appreciation >= 0 ? '+' : ''}{appreciation.toFixed(1)}%
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
													if (confirm('Are you sure you want to delete this asset?')) {
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

<!-- Add Asset Modal -->
<Dialog.Root bind:open={showAddModal}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Add Non-Liquid Asset</Dialog.Title>
			<Dialog.Description>Add a property, vehicle, or other tangible asset</Dialog.Description>
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
				<Label for="assetTypeId">Asset Type</Label>
				<select
					id="assetTypeId"
					name="assetTypeId"
					bind:value={formData.assetTypeId}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					required
				>
					<option value="">Select asset type</option>
					{#each data.nonLiquidAssetTypes as type}
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
					placeholder="e.g., Main Residence"
					bind:value={formData.name}
					required
				/>
			</div>
			
			<div class="space-y-2">
				<Label for="description">Description (Optional)</Label>
				<Input
					id="description"
					name="description"
					placeholder="e.g., 3-bedroom house"
					bind:value={formData.description}
				/>
			</div>
			
			<div class="space-y-2">
				<Label for="location">Location (Optional)</Label>
				<Input
					id="location"
					name="location"
					placeholder="e.g., San Francisco, CA"
					bind:value={formData.location}
				/>
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
					<Label for="quantity">Quantity</Label>
					<Input
						id="quantity"
						name="quantity"
						type="number"
						min="1"
						bind:value={formData.quantity}
					/>
				</div>
			</div>
			
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="purchaseValue">Purchase Value (Optional)</Label>
					<Input
						id="purchaseValue"
						name="purchaseValue"
						type="number"
						step="0.01"
						placeholder="0.00"
						bind:value={formData.purchaseValue}
					/>
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
			
			<!-- Depreciation Section -->
			<div class="space-y-4 border-t pt-4">
				<h4 class="font-medium">Depreciation (Optional)</h4>
				
				<div class="space-y-2">
					<Label>Depreciation Type</Label>
					<div class="grid grid-cols-3 gap-2">
						{#each [
							{ value: 'none', label: 'No Depreciation' },
							{ value: 'yearly', label: 'Yearly' },
							{ value: 'monthly', label: 'Monthly' }
						] as option}
							<button
								type="button"
								onclick={() => formData.depreciationType = option.value}
								class="px-3 py-2 text-sm border rounded-md transition-colors {
									formData.depreciationType === option.value
										? 'bg-primary text-primary-foreground border-primary'
										: 'bg-background border-input hover:bg-muted'
								}"
							>
								{option.label}
							</button>
						{/each}
					</div>
				</div>
				
				{#if formData.depreciationType !== 'none'}
					<div class="space-y-2">
						<Label for="usageYears">Usage Years</Label>
						<Input
							id="usageYears"
							name="usageYears"
							type="number"
							min="1"
							step="0.5"
							placeholder="e.g., 10"
							bind:value={formData.usageYears}
							required={formData.depreciationType !== 'none'}
						/>
						<p class="text-sm text-muted-foreground">
							Expected useful life of the asset in years
						</p>
					</div>
					
					{#if formData.purchaseValue && formData.usageYears && depreciation.yearly > 0}
						<div class="space-y-2 p-4 bg-muted rounded-md">
							<p class="text-sm font-medium">Depreciation Calculation</p>
							<div class="space-y-1 text-sm">
								<div class="flex justify-between">
									<span class="text-muted-foreground">Yearly Depreciation:</span>
									<span>{displayCurrency(depreciation.yearly)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-muted-foreground">Monthly Depreciation:</span>
									<span>{displayCurrency(depreciation.monthly)}</span>
								</div>
								<div class="flex justify-between font-medium">
									<span>Total over {formData.usageYears} years:</span>
									<span>{displayCurrency(depreciation.total)}</span>
								</div>
							</div>
						</div>
					{/if}
				{/if}
			</div>
			
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => showAddModal = false}>
					Cancel
				</Button>
				<Button type="submit">Add Asset</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Asset Modal -->
<Dialog.Root bind:open={showEditModal}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit Non-Liquid Asset</Dialog.Title>
			<Dialog.Description>Update your asset information</Dialog.Description>
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
					<Label>Asset Type</Label>
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
				
				<div class="space-y-2">
					<Label for="edit-location">Location (Optional)</Label>
					<Input
						id="edit-location"
						name="location"
						value={editingAsset.location || ''}
					/>
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
						<Label for="edit-quantity">Quantity</Label>
						<Input
							id="edit-quantity"
							name="quantity"
							type="number"
							min="1"
							value={editingAsset.quantity || 1}
						/>
					</div>
				</div>
				
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="edit-purchaseValue">Purchase Value (Optional)</Label>
						<Input
							id="edit-purchaseValue"
							name="purchaseValue"
							type="number"
							step="0.01"
							value={editingAsset.purchaseValue || ''}
						/>
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
				
				<!-- Depreciation Section -->
				<div class="space-y-4 border-t pt-4">
					<h4 class="font-medium">Depreciation (Optional)</h4>
					
					<div class="space-y-2">
						<Label>Depreciation Type</Label>
						<div class="grid grid-cols-3 gap-2">
							{#each [
								{ value: 'none', label: 'No Depreciation' },
								{ value: 'yearly', label: 'Yearly' },
								{ value: 'monthly', label: 'Monthly' }
							] as option}
								<button
									type="button"
									onclick={() => formData.depreciationType = option.value}
									class="px-3 py-2 text-sm border rounded-md transition-colors {
										formData.depreciationType === option.value
											? 'bg-primary text-primary-foreground border-primary'
											: 'bg-background border-input hover:bg-muted'
									}"
								>
									{option.label}
								</button>
							{/each}
						</div>
					</div>
					
					{#if formData.depreciationType !== 'none'}
						<div class="space-y-2">
							<Label for="edit-usageYears">Usage Years</Label>
							<Input
								id="edit-usageYears"
								name="usageYears"
								type="number"
								min="1"
								step="0.5"
								placeholder="e.g., 10"
								bind:value={formData.usageYears}
								required={formData.depreciationType !== 'none'}
							/>
							<p class="text-sm text-muted-foreground">
								Expected useful life of the asset in years
							</p>
						</div>
						
						{#if formData.purchaseValue && formData.usageYears && depreciation.yearly > 0}
							<div class="space-y-2 p-4 bg-muted rounded-md">
								<p class="text-sm font-medium">Depreciation Calculation</p>
								<div class="space-y-1 text-sm">
									<div class="flex justify-between">
										<span class="text-muted-foreground">Yearly Depreciation:</span>
										<span>{displayCurrency(depreciation.yearly)}</span>
									</div>
									<div class="flex justify-between">
										<span class="text-muted-foreground">Monthly Depreciation:</span>
										<span>{displayCurrency(depreciation.monthly)}</span>
									</div>
									<div class="flex justify-between font-medium">
										<span>Total over {formData.usageYears} years:</span>
										<span>{displayCurrency(depreciation.total)}</span>
									</div>
								</div>
							</div>
						{/if}
					{/if}
				</div>
				
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => { showEditModal = false; editingAsset = null; }}>
						Cancel
					</Button>
					<Button type="submit">Update Asset</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>