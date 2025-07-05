<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Plus, Edit2, Trash2, Save, X, Settings2, CreditCard, Wallet, Receipt, Tag, Loader2 } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Switch } from '$lib/components/ui/switch';
	import PageHeader from '$lib/components/page-header.svelte';
	import type { PageData, ActionData } from './$types';
	
	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Import existing types
	import { liquidAssetTypes } from '$lib/modules/assets/liquid/liquid-assets-data';
	import { nonLiquidAssetTypes } from '$lib/modules/assets/non-liquid/non-liquid-assets-data';
	import { investmentAssetTypes } from '$lib/modules/assets/investment/investment-assets-data';
	import { transactionCategories } from '$lib/modules/transactions/transactions-data';

	// State for managing types - all types now come from database
	let debtTypes = $state(data.debtTypes || []);
	let assetTypes = $state(data.assetTypes || { liquid: [], non_liquid: [], investment: [] });
	let transactionCats = $state(data.transactionCategories || { income: [], expense: [], transfer: [] });

	// Edit states
	let editingDebt = $state<string | null>(null);
	let editingAsset = $state<{ type: string; id: string } | null>(null);
	let editingTransaction = $state<{ category: string; id: string } | null>(null);

	// Add new item states
	let showAddDebtType = $state(false);
	let showAddAssetType = $state(false);
	let showAddTransactionType = $state(false);
	let selectedAssetCategory = $state<'liquid' | 'non_liquid' | 'investment'>('liquid');
	let selectedTransactionCategory = $state<'income' | 'expense' | 'transfer'>('income');

	// Form data for new items
	let newDebtType = $state({ label: '', icon: '' });
	let newAssetType = $state({ label: '', icon: '' });
	let newTransactionType = $state({ label: '' });
	
	// General settings states - initialize from server data
	let currency = $state(data?.preferences?.currencyCode || 'IDR');
	let currencyDisplay = $state(data?.preferences?.currencyDisplay || 'symbol');
	let numberFormat = $state(data?.preferences?.numberFormat || '1.234.567,89');
	let compactNumbers = $state(data?.preferences?.compactNumbers || false);
	let isLoading = $state(false);

	// Helper functions
	async function saveDebtType(id: string, newLabel: string) {
		const formData = new FormData();
		formData.append('id', id);
		formData.append('label', newLabel);
		
		const response = await fetch('?/updateDebtType', {
			method: 'POST',
			body: formData
		});
		
		if (response.ok) {
			const index = debtTypes.findIndex(dt => dt.id === id);
			if (index !== -1) {
				debtTypes[index].label = newLabel;
			}
			editingDebt = null;
		}
	}

	async function deleteDebtType(id: string) {
		const debtType = debtTypes.find(dt => dt.id === id);
		if (debtType?.isSystem) {
			alert('Cannot delete system debt types');
			return;
		}
		
		const formData = new FormData();
		formData.append('id', id);
		
		const response = await fetch('?/deleteDebtType', {
			method: 'POST',
			body: formData
		});
		
		if (response.ok) {
			debtTypes = debtTypes.filter(dt => dt.id !== id);
		}
	}

	async function saveAssetType(category: string, id: string, newLabel: string) {
		const formData = new FormData();
		formData.append('id', id);
		formData.append('label', newLabel);
		
		const response = await fetch('?/updateAssetType', {
			method: 'POST',
			body: formData
		});
		
		if (response.ok) {
			const index = assetTypes[category as keyof typeof assetTypes].findIndex(at => at.id === id);
			if (index !== -1) {
				assetTypes[category as keyof typeof assetTypes][index].label = newLabel;
			}
			editingAsset = null;
		}
	}

	async function deleteAssetType(category: string, id: string) {
		const assetType = assetTypes[category as keyof typeof assetTypes].find(at => at.id === id);
		if (assetType?.isSystem) {
			alert('Cannot delete system asset types');
			return;
		}
		
		const formData = new FormData();
		formData.append('id', id);
		
		const response = await fetch('?/deleteAssetType', {
			method: 'POST',
			body: formData
		});
		
		if (response.ok) {
			assetTypes[category as keyof typeof assetTypes] = assetTypes[category as keyof typeof assetTypes].filter(at => at.id !== id);
		}
	}

	async function saveTransactionType(category: string, id: string, newLabel: string) {
		const formData = new FormData();
		formData.append('id', id);
		formData.append('label', newLabel);
		
		const response = await fetch('?/updateTransactionCategory', {
			method: 'POST',
			body: formData
		});
		
		if (response.ok) {
			const index = transactionCats[category as keyof typeof transactionCats].findIndex(tt => tt.id === id);
			if (index !== -1) {
				transactionCats[category as keyof typeof transactionCats][index].label = newLabel;
			}
			editingTransaction = null;
		}
	}

	async function deleteTransactionType(category: string, id: string) {
		const transactionType = transactionCats[category as keyof typeof transactionCats].find(tt => tt.id === id);
		if (transactionType?.isSystem) {
			alert('Cannot delete system transaction categories');
			return;
		}
		
		const formData = new FormData();
		formData.append('id', id);
		
		const response = await fetch('?/deleteTransactionCategory', {
			method: 'POST',
			body: formData
		});
		
		if (response.ok) {
			transactionCats[category as keyof typeof transactionCats] = transactionCats[category as keyof typeof transactionCats].filter(tt => tt.id !== id);
		}
	}
</script>

<div class="min-h-screen">
	<div class="container mx-auto p-6 lg:p-8">
		<!-- Header -->
		<PageHeader 
			title="Settings"
			description="Manage categories and types for your financial data"
			showAction={false}
		/>

		<!-- Settings Tabs -->
		<Tabs value="general" class="w-full space-y-6">
			<TabsList class="grid grid-cols-2 lg:grid-cols-4 w-full bg-gray-100 dark:bg-gray-800 p-1">
				<TabsTrigger value="general" class="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
					<Settings2 class="mr-2 h-4 w-4" />
					General
				</TabsTrigger>
				<TabsTrigger value="debt-types" class="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
					<CreditCard class="mr-2 h-4 w-4" />
					Debt Types
				</TabsTrigger>
				<TabsTrigger value="asset-types" class="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
					<Wallet class="mr-2 h-4 w-4" />
					Asset Types
				</TabsTrigger>
				<TabsTrigger value="transaction-categories" class="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
					<Receipt class="mr-2 h-4 w-4" />
					Transactions
				</TabsTrigger>
			</TabsList>

		<!-- Debt Types Tab -->
		<TabsContent value="debt-types" class="mt-6">
			<Card class="border shadow-sm">
				<CardHeader>
					<div class="flex items-center justify-between">
						<div>
							<CardTitle>Debt Types</CardTitle>
							<CardDescription>Manage types of debts you can track</CardDescription>
						</div>
						<Button onclick={() => showAddDebtType = true} variant="outline" class="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
							<Plus class="mr-2 h-4 w-4" />
							Add Debt Type
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-2">
						{#each debtTypes as debtType}
							<div class="flex items-center justify-between p-3 rounded-lg border">
								<div class="flex items-center gap-3">
									<span class="text-xl">{debtType.icon}</span>
									{#if editingDebt === debtType.id}
										<Input
											value={debtType.label}
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													saveDebtType(debtType.id, e.currentTarget.value);
												} else if (e.key === 'Escape') {
													editingDebt = null;
												}
											}}
											onblur={(e) => saveDebtType(debtType.id, e.currentTarget.value)}
											class="w-48"
											autofocus
										/>
									{:else}
										<span class="font-medium">{debtType.label}</span>
										{#if debtType.isSystem}
											<Badge variant="secondary" class="ml-2">System</Badge>
										{/if}
									{/if}
								</div>
								<div class="flex items-center gap-2">
									{#if editingDebt === debtType.id}
										<Button size="icon" variant="ghost" onclick={() => editingDebt = null}>
											<X class="h-4 w-4" />
										</Button>
									{:else}
										{#if !debtType.isSystem}
											<Button size="icon" variant="ghost" onclick={() => editingDebt = debtType.id}>
												<Edit2 class="h-4 w-4" />
											</Button>
											<Button size="icon" variant="ghost" onclick={() => deleteDebtType(debtType.id)}>
												<Trash2 class="h-4 w-4" />
											</Button>
										{/if}
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		</TabsContent>

		<!-- Asset Types Tab -->
		<TabsContent value="asset-types" class="mt-6">
			<Card class="border shadow-sm">
				<CardHeader>
					<div class="flex items-center justify-between">
						<div>
							<CardTitle>Asset Types</CardTitle>
							<CardDescription>Manage types of assets you can track</CardDescription>
						</div>
						<Button onclick={() => showAddAssetType = true} variant="outline" class="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
							<Plus class="mr-2 h-4 w-4" />
							Add Asset Type
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Tabs value="liquid" class="w-full">
						<TabsList class="grid grid-cols-3 w-full mb-4">
							<TabsTrigger value="liquid">Liquid Assets</TabsTrigger>
							<TabsTrigger value="non_liquid">Non-Liquid Assets</TabsTrigger>
							<TabsTrigger value="investment">Investments</TabsTrigger>
						</TabsList>
						
						{#each Object.entries(assetTypes) as [category, types]}
							<TabsContent value={category} class="space-y-2">
								{#each types as assetType}
									<div class="flex items-center justify-between p-3 rounded-lg border">
										<div class="flex items-center gap-3">
											<span class="text-xl">{assetType.icon}</span>
											{#if editingAsset?.type === category && editingAsset?.id === assetType.id}
												<Input
													value={assetType.label}
													onkeydown={(e) => {
														if (e.key === 'Enter') {
															saveAssetType(category, assetType.id, e.currentTarget.value);
														} else if (e.key === 'Escape') {
															editingAsset = null;
														}
													}}
													onblur={(e) => saveAssetType(category, assetType.id, e.currentTarget.value)}
													class="w-48"
													autofocus
												/>
											{:else}
												<span class="font-medium">{assetType.label}</span>
												{#if assetType.isSystem}
													<Badge variant="secondary" class="ml-2">System</Badge>
												{/if}
											{/if}
										</div>
										<div class="flex items-center gap-2">
											{#if editingAsset?.type === category && editingAsset?.id === assetType.id}
												<Button size="icon" variant="ghost" onclick={() => editingAsset = null}>
													<X class="h-4 w-4" />
												</Button>
											{:else}
												{#if !assetType.isSystem}
													<Button size="icon" variant="ghost" onclick={() => editingAsset = { type: category, id: assetType.id }}>
														<Edit2 class="h-4 w-4" />
													</Button>
													<Button size="icon" variant="ghost" onclick={() => deleteAssetType(category, assetType.id)}>
														<Trash2 class="h-4 w-4" />
													</Button>
												{/if}
											{/if}
										</div>
									</div>
								{/each}
							</TabsContent>
						{/each}
					</Tabs>
				</CardContent>
			</Card>
		</TabsContent>

		<!-- Transaction Categories Tab -->
		<TabsContent value="transaction-categories" class="mt-6">
			<Card class="border shadow-sm">
				<CardHeader>
					<div class="flex items-center justify-between">
						<div>
							<CardTitle>Transaction Categories</CardTitle>
							<CardDescription>Manage transaction types and categories</CardDescription>
						</div>
						<Button onclick={() => showAddTransactionType = true} variant="outline" class="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
							<Plus class="mr-2 h-4 w-4" />
							Add Transaction Type
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Tabs value="income" class="w-full">
						<TabsList class="grid grid-cols-3 w-full mb-4">
							<TabsTrigger value="income">Income</TabsTrigger>
							<TabsTrigger value="expense">Expenses</TabsTrigger>
							<TabsTrigger value="transfer">Transfers</TabsTrigger>
						</TabsList>
						
						{#each Object.entries(transactionCats) as [category, types]}
							<TabsContent value={category} class="space-y-2">
								{#each types as transType}
									<div class="flex items-center justify-between p-3 rounded-lg border">
										<div class="flex items-center gap-3">
											<Badge variant={category === 'income' ? 'default' : category === 'expense' ? 'destructive' : 'secondary'}>
												{category}
											</Badge>
											{#if editingTransaction?.category === category && editingTransaction?.id === transType.id}
												<Input
													value={transType.label}
													onkeydown={(e) => {
														if (e.key === 'Enter') {
															saveTransactionType(category, transType.id, e.currentTarget.value);
														} else if (e.key === 'Escape') {
															editingTransaction = null;
														}
													}}
													onblur={(e) => saveTransactionType(category, transType.id, e.currentTarget.value)}
													class="w-48"
													autofocus
												/>
											{:else}
												<span class="font-medium">{transType.label}</span>
												{#if transType.isSystem}
													<Badge variant="secondary" class="ml-2">System</Badge>
												{/if}
											{/if}
										</div>
										<div class="flex items-center gap-2">
											{#if editingTransaction?.category === category && editingTransaction?.id === transType.id}
												<Button size="icon" variant="ghost" onclick={() => editingTransaction = null}>
													<X class="h-4 w-4" />
												</Button>
											{:else}
												{#if !transType.isSystem}
													<Button size="icon" variant="ghost" onclick={() => editingTransaction = { category, id: transType.id }}>
														<Edit2 class="h-4 w-4" />
													</Button>
													<Button size="icon" variant="ghost" onclick={() => deleteTransactionType(category, transType.id)}>
														<Trash2 class="h-4 w-4" />
													</Button>
												{/if}
											{/if}
										</div>
									</div>
								{/each}
							</TabsContent>
						{/each}
					</Tabs>
				</CardContent>
			</Card>
		</TabsContent>

		<!-- General Settings Tab -->
		<TabsContent value="general" class="mt-6">
			<form 
				method="POST"
				action="?/updatePreferences"
				use:enhance={() => {
					isLoading = true;
					return async ({ update }) => {
						await update();
						isLoading = false;
					};
				}}
			>
				<div class="grid gap-6">
					<!-- Currency Settings -->
					<Card class="border shadow-sm">
						<CardHeader>
							<CardTitle class="text-xl">Currency Settings</CardTitle>
							<CardDescription>Configure your default currency and display preferences</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="grid gap-4">
								<div class="grid gap-2">
									<Label for="currency">Default Currency</Label>
									<select
										id="currency"
										name="currency"
										bind:value={currency}
										class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									>
										{#each data.currencies as curr}
											<option value={curr.code}>{curr.code} - {curr.name}</option>
										{/each}
									</select>
								</div>
								<div class="grid gap-2">
									<Label for="currency-display">Currency Display</Label>
									<select
										id="currency-display"
										name="currency-display"
										bind:value={currencyDisplay}
										class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									>
										<option value="symbol">Symbol ({data.currencies.find(c => c.code === currency)?.symbol || '$'})</option>
										<option value="code">Code ({currency})</option>
										<option value="both">Both ({currency} {data.currencies.find(c => c.code === currency)?.symbol || '$'})</option>
									</select>
								</div>
							</div>
						</CardContent>
					</Card>

					<!-- Display Preferences -->
					<Card class="border shadow-sm">
						<CardHeader>
							<CardTitle class="text-xl">Display Preferences</CardTitle>
							<CardDescription>Customize how information is displayed</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="grid gap-4">
								<div class="grid gap-2">
									<Label for="number-format">Number Format</Label>
									<select
										id="number-format"
										name="number-format"
										bind:value={numberFormat}
										class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									>
										{#each data.numberFormats as format}
											<option value={format.value}>{format.label}</option>
										{/each}
									</select>
								</div>
								<div class="flex items-center justify-between">
									<div class="space-y-0.5">
										<Label for="compact-numbers">Compact Numbers</Label>
										<p class="text-sm text-muted-foreground">Show large numbers as 1.5M instead of 1,500,000</p>
									</div>
									<Switch id="compact-numbers" name="compact-numbers" bind:checked={compactNumbers} />
								</div>
							</div>
						</CardContent>
					</Card>

					<!-- Save Changes Button -->
					<div class="flex justify-end mt-8">
						<Button type="submit" size="lg" class="min-w-[200px]" disabled={isLoading}>
							{#if isLoading}
								<Loader2 class="mr-2 h-5 w-5 animate-spin" />
								Saving...
							{:else}
								<Save class="mr-2 h-5 w-5" />
								Save All Changes
							{/if}
						</Button>
					</div>
					
					{#if form?.success}
						<div class="mt-4 p-4 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 rounded-lg">
							Settings saved successfully!
						</div>
					{/if}
					
					{#if form?.error}
						<div class="mt-4 p-4 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 rounded-lg">
							{form.error}
						</div>
					{/if}
				</div>
			</form>
		</TabsContent>
	</Tabs>
	</div>
</div>

<!-- Add Debt Type Modal -->
<Dialog.Root bind:open={showAddDebtType}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add New Debt Type</Dialog.Title>
			<Dialog.Description>Create a new debt type for tracking</Dialog.Description>
		</Dialog.Header>
		<form 
			method="POST" 
			action="?/createDebtType"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						showAddDebtType = false;
						newDebtType = { label: '', icon: '' };
						await update();
						// Refresh debt types from server
						location.reload();
					} else {
						await update();
					}
				};
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="debt-label">Label</Label>
				<Input
					id="debt-label"
					name="label"
					placeholder="e.g., Student Loan"
					bind:value={newDebtType.label}
					required
				/>
			</div>
			<div class="space-y-2">
				<Label for="debt-icon">Icon (Emoji)</Label>
				<Input
					id="debt-icon"
					name="icon"
					placeholder="e.g., 🎓"
					bind:value={newDebtType.icon}
					required
				/>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => showAddDebtType = false}>
					Cancel
				</Button>
				<Button type="submit">Add Debt Type</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Add Asset Type Modal -->
<Dialog.Root bind:open={showAddAssetType}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add New Asset Type</Dialog.Title>
			<Dialog.Description>Create a new asset type for tracking</Dialog.Description>
		</Dialog.Header>
		<form 
			method="POST" 
			action="?/createAssetType"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						showAddAssetType = false;
						newAssetType = { label: '', icon: '' };
						await update();
						location.reload();
					} else {
						await update();
					}
				};
			}}
			class="space-y-4">
			<div class="space-y-2">
				<Label for="asset-category">Category</Label>
				<select
					id="asset-category"
					name="category"
					bind:value={selectedAssetCategory}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					<option value="liquid">Liquid Assets</option>
					<option value="non_liquid">Non-Liquid Assets</option>
					<option value="investment">Investments</option>
				</select>
			</div>
			<div class="space-y-2">
				<Label for="asset-label">Label</Label>
				<Input
					id="asset-label"
					name="label"
					placeholder="e.g., Retirement Fund"
					bind:value={newAssetType.label}
					required
				/>
			</div>
			<div class="space-y-2">
				<Label for="asset-icon">Icon (Emoji)</Label>
				<Input
					id="asset-icon"
					name="icon"
					placeholder="e.g., 💰"
					bind:value={newAssetType.icon}
					required
				/>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => showAddAssetType = false}>
					Cancel
				</Button>
				<Button type="submit">Add Asset Type</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Add Transaction Type Modal -->
<Dialog.Root bind:open={showAddTransactionType}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add New Transaction Type</Dialog.Title>
			<Dialog.Description>Create a new transaction type</Dialog.Description>
		</Dialog.Header>
		<form 
			method="POST" 
			action="?/createTransactionCategory"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						showAddTransactionType = false;
						newTransactionType = { label: '' };
						await update();
						location.reload();
					} else {
						await update();
					}
				};
			}}
			class="space-y-4">
			<div class="space-y-2">
				<Label for="trans-category">Category</Label>
				<select
					id="trans-category"
					name="type"
					bind:value={selectedTransactionCategory}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					<option value="income">Income</option>
					<option value="expense">Expense</option>
					<option value="transfer">Transfer</option>
				</select>
			</div>
			<div class="space-y-2">
				<Label for="trans-label">Label</Label>
				<Input
					id="trans-label"
					name="label"
					placeholder="e.g., Subscription"
					bind:value={newTransactionType.label}
					required
				/>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => showAddTransactionType = false}>
					Cancel
				</Button>
				<Button type="submit">Add Transaction Type</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>