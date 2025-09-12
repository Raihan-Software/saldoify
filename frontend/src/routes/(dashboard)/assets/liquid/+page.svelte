<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Wallet, DollarSign, Hash, Building2 } from '@lucide/svelte';
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
		accountNumber: '',
		bankName: '',
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
			accountNumber: '',
			bankName: '',
			notes: ''
		};
	}
</script>

<div class="p-8 space-y-6">

	<!-- Header -->
	<PageHeader 
		title="Liquid Assets"
		description="Manage your cash and easily accessible assets"
		actionLabel="Add Liquid Asset"
		onAction={() => showAddModal = true}
	/>

	<!-- Summary Cards -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card class="border shadow-sm">
			<CardHeader class="pb-2">
				<div class="flex items-center justify-between">
					<CardDescription>Total Value</CardDescription>
					<DollarSign class="h-4 w-4 text-muted-foreground" />
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
					<Wallet class="h-4 w-4 text-muted-foreground" />
				</div>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">{data.summary.count}</p>
			</CardContent>
		</Card>
		
		<Card class="border shadow-sm">
			<CardHeader class="pb-2">
				<div class="flex items-center justify-between">
					<CardDescription>Growth</CardDescription>
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
			<CardTitle>Your Liquid Assets</CardTitle>
			<CardDescription>All your cash and easily accessible assets</CardDescription>
		</CardHeader>
		<CardContent>
			{#if data.assets.length === 0}
				<div class="text-center py-12">
					<Wallet class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
					<h3 class="text-lg font-semibold mb-2">No liquid assets yet</h3>
					<p class="text-muted-foreground mb-4">Add your first liquid asset to get started</p>
					<Button onclick={() => showAddModal = true}>
						<Plus class="mr-2 h-4 w-4" />
						Add Liquid Asset
					</Button>
				</div>
			{:else}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Bank</TableHead>
							<TableHead>Account</TableHead>
							<TableHead class="text-right">Value</TableHead>
							<TableHead class="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each data.assets as asset}
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
									{#if asset.bankName}
										<div class="flex items-center gap-1">
											<Building2 class="h-3 w-3 text-muted-foreground" />
											<span class="text-sm">{asset.bankName}</span>
										</div>
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</TableCell>
								<TableCell>
									{#if asset.accountNumber}
										<div class="flex items-center gap-1">
											<Hash class="h-3 w-3 text-muted-foreground" />
											<span class="text-sm font-mono">****{asset.accountNumber.slice(-4)}</span>
										</div>
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</TableCell>
								<TableCell class="text-right font-medium">
									{displayCurrency(asset.currentValue)}
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
			<Dialog.Title>Add Liquid Asset</Dialog.Title>
			<Dialog.Description>Add a new cash or easily accessible asset</Dialog.Description>
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
					{#each data.liquidAssetTypes as type}
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
					placeholder="e.g., Main Checking Account"
					bind:value={formData.name}
					required
				/>
			</div>
			
			<div class="space-y-2">
				<Label for="description">Description (Optional)</Label>
				<Input
					id="description"
					name="description"
					placeholder="e.g., Primary account for daily expenses"
					bind:value={formData.description}
				/>
			</div>
			
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="bankName">Bank Name (Optional)</Label>
					<Input
						id="bankName"
						name="bankName"
						placeholder="e.g., Chase Bank"
						bind:value={formData.bankName}
					/>
				</div>
				
				<div class="space-y-2">
					<Label for="accountNumber">Account Number (Optional)</Label>
					<Input
						id="accountNumber"
						name="accountNumber"
						placeholder="e.g., 1234567890"
						bind:value={formData.accountNumber}
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
				<Button type="submit">Add Asset</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Asset Modal -->
<Dialog.Root bind:open={showEditModal}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit Liquid Asset</Dialog.Title>
			<Dialog.Description>Update your liquid asset information</Dialog.Description>
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
				
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="edit-bankName">Bank Name (Optional)</Label>
						<Input
							id="edit-bankName"
							name="bankName"
							value={editingAsset.bankName || ''}
						/>
					</div>
					
					<div class="space-y-2">
						<Label for="edit-accountNumber">Account Number (Optional)</Label>
						<Input
							id="edit-accountNumber"
							name="accountNumber"
							value={editingAsset.accountNumber || ''}
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
					<Button type="submit">Update Asset</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>