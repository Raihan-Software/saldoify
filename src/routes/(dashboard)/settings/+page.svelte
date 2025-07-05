<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Plus, Edit2, Trash2, Save, X, Settings2, CreditCard, Wallet, Receipt, Tag } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Switch } from '$lib/components/ui/switch';
	import PageHeader from '$lib/components/page-header.svelte';

	// Import existing types
	import { liabilityTypes } from '$lib/modules/networth/networth-data';
	import { liquidAssetTypes } from '$lib/modules/assets/liquid/liquid-assets-data';
	import { nonLiquidAssetTypes } from '$lib/modules/assets/non-liquid/non-liquid-assets-data';
	import { investmentAssetTypes } from '$lib/modules/assets/investment/investment-assets-data';
	import { transactionCategories } from '$lib/modules/transactions/transactions-data';

	// State for managing types with additional mock data
	let debtTypes = $state([
		...Object.entries(liabilityTypes).map(([key, value]) => ({ id: key, ...value })),
		{ id: 'business-loan', label: 'Business Loan', icon: '🏢' },
		{ id: 'education-loan', label: 'Education Loan', icon: '🎓' },
		{ id: 'payday-loan', label: 'Payday Loan', icon: '📅' }
	]);
	
	let assetTypes = $state({
		liquid: [
			...Object.entries(liquidAssetTypes).map(([key, value]) => ({ id: key, ...value })),
			{ id: 'crypto-wallet', label: 'Crypto Wallet', icon: '🔐' },
			{ id: 'e-wallet', label: 'E-Wallet', icon: '📱' },
			{ id: 'foreign-currency', label: 'Foreign Currency', icon: '💱' }
		],
		nonLiquid: [
			...Object.entries(nonLiquidAssetTypes).map(([key, value]) => ({ id: key, ...value })),
			{ id: 'furniture', label: 'Furniture', icon: '🪑' },
			{ id: 'appliances', label: 'Home Appliances', icon: '🏠' },
			{ id: 'books', label: 'Book Collection', icon: '📚' },
			{ id: 'art', label: 'Art & Paintings', icon: '🖼️' }
		],
		investment: [
			...Object.entries(investmentAssetTypes).map(([key, value]) => ({ id: key, ...value })),
			{ id: 'reit', label: 'REITs', icon: '🏘️' },
			{ id: 'p2p-lending', label: 'P2P Lending', icon: '🤝' },
			{ id: 'gold-account', label: 'Gold Account', icon: '🥇' },
			{ id: 'forex', label: 'Forex', icon: '💱' }
		]
	});
	
	let transactionCats = $state({
		income: [
			...Object.entries(transactionCategories.income.types).map(([key, value]) => ({ id: key, label: value })),
			{ id: 'bonus', label: 'Bonus' },
			{ id: 'rental', label: 'Rental Income' },
			{ id: 'business', label: 'Business Income' },
			{ id: 'interest', label: 'Interest Income' },
			{ id: 'cashback', label: 'Cashback & Rewards' }
		],
		expense: [
			...Object.entries(transactionCategories.expense.types).map(([key, value]) => ({ id: key, label: value })),
			{ id: 'rent', label: 'Rent' },
			{ id: 'insurance', label: 'Insurance' },
			{ id: 'subscription', label: 'Subscriptions' },
			{ id: 'personal-care', label: 'Personal Care' },
			{ id: 'pet', label: 'Pet Expenses' },
			{ id: 'donation', label: 'Donations' },
			{ id: 'tax', label: 'Taxes' },
			{ id: 'household', label: 'Household Items' }
		],
		transfer: [
			...Object.entries(transactionCategories.transfer.types).map(([key, value]) => ({ id: key, label: value })),
			{ id: 'loan-payment', label: 'Loan Payment' },
			{ id: 'family', label: 'Family Transfer' },
			{ id: 'emergency-fund', label: 'Emergency Fund' }
		]
	});

	// Edit states
	let editingDebt = $state<string | null>(null);
	let editingAsset = $state<{ type: string; id: string } | null>(null);
	let editingTransaction = $state<{ category: string; id: string } | null>(null);

	// Add new item states
	let showAddDebtType = $state(false);
	let showAddAssetType = $state(false);
	let showAddTransactionType = $state(false);
	let selectedAssetCategory = $state<'liquid' | 'nonLiquid' | 'investment'>('liquid');
	let selectedTransactionCategory = $state<'income' | 'expense' | 'transfer'>('income');

	// Form data for new items
	let newDebtType = $state({ label: '', icon: '' });
	let newAssetType = $state({ label: '', icon: '' });
	let newTransactionType = $state({ label: '' });
	
	// General settings states
	let showDecimals = $state(true);
	let compactNumbers = $state(false);
	let hideBalances = $state(false);

	// Helper functions
	function saveDebtType(id: string, newLabel: string) {
		const index = debtTypes.findIndex(dt => dt.id === id);
		if (index !== -1) {
			debtTypes[index].label = newLabel;
		}
		editingDebt = null;
	}

	function deleteDebtType(id: string) {
		debtTypes = debtTypes.filter(dt => dt.id !== id);
	}

	function addDebtType() {
		if (newDebtType.label && newDebtType.icon) {
			const id = newDebtType.label.toLowerCase().replace(/\s+/g, '-');
			debtTypes = [...debtTypes, { id, label: newDebtType.label, icon: newDebtType.icon }];
			newDebtType = { label: '', icon: '' };
			showAddDebtType = false;
		}
	}

	function saveAssetType(category: string, id: string, newLabel: string) {
		const index = assetTypes[category as keyof typeof assetTypes].findIndex(at => at.id === id);
		if (index !== -1) {
			assetTypes[category as keyof typeof assetTypes][index].label = newLabel;
		}
		editingAsset = null;
	}

	function deleteAssetType(category: string, id: string) {
		assetTypes[category as keyof typeof assetTypes] = assetTypes[category as keyof typeof assetTypes].filter(at => at.id !== id);
	}

	function addAssetType() {
		if (newAssetType.label && newAssetType.icon) {
			const id = newAssetType.label.toLowerCase().replace(/\s+/g, '-');
			assetTypes[selectedAssetCategory] = [...assetTypes[selectedAssetCategory], { id, label: newAssetType.label, icon: newAssetType.icon }];
			newAssetType = { label: '', icon: '' };
			showAddAssetType = false;
		}
	}

	function saveTransactionType(category: string, id: string, newLabel: string) {
		const index = transactionCats[category as keyof typeof transactionCats].findIndex(tt => tt.id === id);
		if (index !== -1) {
			transactionCats[category as keyof typeof transactionCats][index].label = newLabel;
		}
		editingTransaction = null;
	}

	function deleteTransactionType(category: string, id: string) {
		transactionCats[category as keyof typeof transactionCats] = transactionCats[category as keyof typeof transactionCats].filter(tt => tt.id !== id);
	}

	function addTransactionType() {
		if (newTransactionType.label) {
			const id = newTransactionType.label.toLowerCase().replace(/\s+/g, '-');
			transactionCats[selectedTransactionCategory] = [...transactionCats[selectedTransactionCategory], { id, label: newTransactionType.label }];
			newTransactionType = { label: '' };
			showAddTransactionType = false;
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
									{/if}
								</div>
								<div class="flex items-center gap-2">
									{#if editingDebt === debtType.id}
										<Button size="icon" variant="ghost" onclick={() => editingDebt = null}>
											<X class="h-4 w-4" />
										</Button>
									{:else}
										<Button size="icon" variant="ghost" onclick={() => editingDebt = debtType.id}>
											<Edit2 class="h-4 w-4" />
										</Button>
										<Button size="icon" variant="ghost" onclick={() => deleteDebtType(debtType.id)}>
											<Trash2 class="h-4 w-4" />
										</Button>
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
							<TabsTrigger value="nonLiquid">Non-Liquid Assets</TabsTrigger>
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
											{/if}
										</div>
										<div class="flex items-center gap-2">
											{#if editingAsset?.type === category && editingAsset?.id === assetType.id}
												<Button size="icon" variant="ghost" onclick={() => editingAsset = null}>
													<X class="h-4 w-4" />
												</Button>
											{:else}
												<Button size="icon" variant="ghost" onclick={() => editingAsset = { type: category, id: assetType.id }}>
													<Edit2 class="h-4 w-4" />
												</Button>
												<Button size="icon" variant="ghost" onclick={() => deleteAssetType(category, assetType.id)}>
													<Trash2 class="h-4 w-4" />
												</Button>
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
											{/if}
										</div>
										<div class="flex items-center gap-2">
											{#if editingTransaction?.category === category && editingTransaction?.id === transType.id}
												<Button size="icon" variant="ghost" onclick={() => editingTransaction = null}>
													<X class="h-4 w-4" />
												</Button>
											{:else}
												<Button size="icon" variant="ghost" onclick={() => editingTransaction = { category, id: transType.id }}>
													<Edit2 class="h-4 w-4" />
												</Button>
												<Button size="icon" variant="ghost" onclick={() => deleteTransactionType(category, transType.id)}>
													<Trash2 class="h-4 w-4" />
												</Button>
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
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								>
									<option value="IDR" selected>IDR - Indonesian Rupiah</option>
									<option value="USD">USD - US Dollar</option>
									<option value="EUR">EUR - Euro</option>
									<option value="SGD">SGD - Singapore Dollar</option>
									<option value="MYR">MYR - Malaysian Ringgit</option>
									<option value="JPY">JPY - Japanese Yen</option>
									<option value="GBP">GBP - British Pound</option>
									<option value="AUD">AUD - Australian Dollar</option>
								</select>
							</div>
							<div class="grid gap-2">
								<Label for="currency-display">Currency Display</Label>
								<select
									id="currency-display"
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								>
									<option value="symbol" selected>Symbol (Rp)</option>
									<option value="code">Code (IDR)</option>
									<option value="both">Both (IDR Rp)</option>
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
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								>
									<option value="1.234.567,89" selected>1.234.567,89 (Indonesia)</option>
									<option value="1,234,567.89">1,234,567.89 (US/UK)</option>
									<option value="1 234 567,89">1 234 567,89 (France)</option>
									<option value="1'234'567.89">1'234'567.89 (Switzerland)</option>
								</select>
							</div>
							<div class="flex items-center justify-between">
								<div class="space-y-0.5">
									<Label for="compact-numbers">Compact Numbers</Label>
									<p class="text-sm text-muted-foreground">Show large numbers as 1.5M instead of 1,500,000</p>
								</div>
								<Switch id="compact-numbers" bind:checked={compactNumbers} />
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Save Changes Button -->
				<div class="flex justify-end mt-8">
					<Button size="lg" class="min-w-[200px]">
						<Save class="mr-2 h-5 w-5" />
						Save All Changes
					</Button>
				</div>
			</div>
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
		<form onsubmit={(e) => { e.preventDefault(); addDebtType(); }} class="space-y-4">
			<div class="space-y-2">
				<Label for="debt-label">Label</Label>
				<Input
					id="debt-label"
					placeholder="e.g., Student Loan"
					bind:value={newDebtType.label}
					required
				/>
			</div>
			<div class="space-y-2">
				<Label for="debt-icon">Icon (Emoji)</Label>
				<Input
					id="debt-icon"
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
		<form onsubmit={(e) => { e.preventDefault(); addAssetType(); }} class="space-y-4">
			<div class="space-y-2">
				<Label for="asset-category">Category</Label>
				<select
					id="asset-category"
					bind:value={selectedAssetCategory}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					<option value="liquid">Liquid Assets</option>
					<option value="nonLiquid">Non-Liquid Assets</option>
					<option value="investment">Investments</option>
				</select>
			</div>
			<div class="space-y-2">
				<Label for="asset-label">Label</Label>
				<Input
					id="asset-label"
					placeholder="e.g., Retirement Fund"
					bind:value={newAssetType.label}
					required
				/>
			</div>
			<div class="space-y-2">
				<Label for="asset-icon">Icon (Emoji)</Label>
				<Input
					id="asset-icon"
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
		<form onsubmit={(e) => { e.preventDefault(); addTransactionType(); }} class="space-y-4">
			<div class="space-y-2">
				<Label for="trans-category">Category</Label>
				<select
					id="trans-category"
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