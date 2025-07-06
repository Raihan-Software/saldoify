<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, TrendingUp, TrendingDown, Activity, Calendar, Wallet, ArrowRightLeft, FileText, Hash, CreditCard } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import PageHeader from '$lib/components/page-header.svelte';
	import { 
		mockTransactions, 
		groupTransactionsByDate,
		calculateDailyTotal,
		getCategoryIcon,
		getCategoryColor,
		transactionCategories,
		type Transaction 
	} from '$lib/modules/transactions/transactions-data';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	console.log(data);

	let transactions = $state(mockTransactions);
	let showAddModal = $state(false);
	
	// Group transactions by date
	let groupedTransactions = $derived(groupTransactionsByDate(transactions));
	
	// Calculate monthly totals
	let monthlyTotals = $derived((() => {
		const now = new Date();
		const thisMonth = transactions.filter(t => 
			t.date.getMonth() === now.getMonth() && 
			t.date.getFullYear() === now.getFullYear()
		);
		
		const income = thisMonth
			.filter(t => t.category === 'income')
			.reduce((sum, t) => sum + t.amount, 0);
		
		const expense = thisMonth
			.filter(t => t.category === 'expense')
			.reduce((sum, t) => sum + t.amount, 0);
			
		return { income, expense, net: income - expense };
	})());
	
	// Form state
	let formData = $state({
		date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:MM
		description: '',
		category: 'expense' as Transaction['category'],
		type: 'food',
		amount: '',
		account: '',
		fromAccount: '',
		toAccount: '',
		notes: ''
	});
	
	// Get available accounts from database
	const availableAccounts = $derived(data.liquidAssets.map(asset => ({
		id: asset.id,
		name: asset.name,
		institution: asset.bankName,
		balance: asset.currentValue
	})));
	
	// Update available types when category changes
	let availableTypes = $derived(
		transactionCategories[formData.category].types
	);
	
	// Dynamic placeholders based on category
	let descriptionPlaceholder = $derived(
		formData.category === 'income' ? 'e.g., Monthly salary' :
		formData.category === 'expense' ? 'e.g., Lunch at restaurant' :
		formData.category === 'transfer' ? 'e.g., Transfer to savings' :
		'Enter description'
	);
	
	// Reset type when category changes
	$effect(() => {
		const types = Object.keys(availableTypes);
		if (!types.includes(formData.type)) {
			formData.type = types[0];
		}
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatTime(date: Date): string {
		return new Intl.DateTimeFormat('id-ID', {
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}
	
	function handleAddTransaction() {
		if (!formData.description || !formData.amount) return;
		
		// Validate transfer specific fields
		if (formData.category === 'transfer') {
			if (!formData.fromAccount || !formData.toAccount) {
				alert('Please select both source and destination accounts for the transfer');
				return;
			}
			if (formData.fromAccount === formData.toAccount) {
				alert('Source and destination accounts must be different');
				return;
			}
		}
		
		const newTransaction: Transaction = {
			id: Date.now().toString(),
			date: new Date(formData.date),
			description: formData.description,
			category: formData.category,
			type: formData.type,
			amount: parseFloat(formData.amount),
			account: formData.category === 'transfer' 
				? `${getAccountName(formData.fromAccount)} → ${getAccountName(formData.toAccount)}`
				: getAccountName(formData.account) || undefined,
			notes: formData.notes || undefined
		};
		
		transactions = [...transactions, newTransaction];
		
		// Reset form
		formData = {
			date: new Date().toISOString().slice(0, 16),
			description: '',
			category: 'expense',
			type: 'food',
			amount: '',
			account: '',
			fromAccount: '',
			toAccount: '',
			notes: ''
		};
		
		showAddModal = false;
	}
	
	function formatNumberInput(value: string): string {
		const digits = value.replace(/\D/g, '');
		return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	}
	
	function getAccountName(accountId: string): string {
		const account = availableAccounts.find(a => a.id === accountId);
		return account ? account.name : accountId;
	}
</script>

<div class="p-8 space-y-6">
	<!-- Header -->
	<PageHeader 
		title="Transactions"
		description="Track your daily income and expenses"
		actionLabel="Add Transaction"
		actionIcon={Plus}
		onAction={() => showAddModal = true}
	/>

	<!-- Summary Cards -->
	<div class="grid gap-4 md:grid-cols-3">
		<!-- Monthly Income Card -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Monthly Income</CardTitle>
				<TrendingUp class="h-4 w-4 text-green-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-green-600">{formatCurrency(monthlyTotals.income)}</div>
				<p class="text-xs text-muted-foreground mt-1">
					This month's total income
				</p>
			</CardContent>
		</Card>

		<!-- Monthly Expense Card -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Monthly Expenses</CardTitle>
				<TrendingDown class="h-4 w-4 text-red-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-red-600">{formatCurrency(monthlyTotals.expense)}</div>
				<p class="text-xs text-muted-foreground mt-1">
					This month's total expenses
				</p>
			</CardContent>
		</Card>

		<!-- Net Card -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Net Cash Flow</CardTitle>
				<Activity class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold {monthlyTotals.net >= 0 ? 'text-green-600' : 'text-red-600'}">
					{formatCurrency(monthlyTotals.net)}
				</div>
				<p class="text-xs text-muted-foreground mt-1">
					Income minus expenses
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Transactions by Day -->
	<div class="space-y-6">
		{#each groupedTransactions as [dateKey, dayTransactions]}
			{@const dailyTotal = calculateDailyTotal(dayTransactions)}
			<Card>
				<CardHeader class="pb-4">
					<div class="flex items-center justify-between">
						<CardTitle class="text-lg">{dateKey}</CardTitle>
						<div class="flex items-center gap-4 text-sm">
							<span class="text-green-600">+{formatCurrency(dailyTotal.income)}</span>
							<span class="text-red-600">-{formatCurrency(dailyTotal.expense)}</span>
							<span class="font-medium {dailyTotal.net >= 0 ? 'text-green-600' : 'text-red-600'}">
								{dailyTotal.net >= 0 ? '+' : ''}{formatCurrency(dailyTotal.net)}
							</span>
						</div>
					</div>
				</CardHeader>
				<CardContent class="pt-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead class="w-[100px]">Time</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Account</TableHead>
								<TableHead class="text-right">Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each dayTransactions as transaction}
								<TableRow>
									<TableCell class="text-muted-foreground">
										{formatTime(transaction.date)}
									</TableCell>
									<TableCell class="font-medium">
										{transaction.description}
										{#if transaction.notes}
											<p class="text-xs text-muted-foreground">{transaction.notes}</p>
										{/if}
									</TableCell>
									<TableCell>
										<div class="flex items-center gap-2">
											<span class="text-lg">{getCategoryIcon(transaction.category)}</span>
											<div>
												<p class="text-sm font-medium">{transactionCategories[transaction.category].label}</p>
												<p class="text-xs text-muted-foreground">
													{availableTypes[transaction.type] || transaction.type}
												</p>
											</div>
										</div>
									</TableCell>
									<TableCell>{transaction.account || '-'}</TableCell>
									<TableCell class="text-right">
										<span class="font-medium {getCategoryColor(transaction.category)}">
											{transaction.category === 'income' ? '+' : transaction.category === 'expense' ? '-' : ''}{formatCurrency(transaction.amount)}
										</span>
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		{/each}
	</div>
</div>

<!-- Add Transaction Modal -->
<Dialog.Root bind:open={showAddModal}>
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>New Transaction</Dialog.Title>
			<Dialog.Description>
				Record your income, expense, or transfer
			</Dialog.Description>
		</Dialog.Header>
		
		<form onsubmit={(e) => { e.preventDefault(); handleAddTransaction(); }} class="space-y-6 mt-6">
			<!-- Category Selection - Visual Cards -->
			<div class="space-y-2">
				<Label class="text-sm font-medium text-gray-700">Transaction Type</Label>
				<div class="grid grid-cols-3 gap-3">
					{#each Object.entries(transactionCategories) as [value, { label, icon }]}
						<button
							type="button"
							onclick={() => formData.category = value}
							class="relative p-4 rounded-lg border-2 transition-all duration-200 {
								formData.category === value 
									? value === 'income' ? 'border-green-500 bg-green-50' 
									: value === 'expense' ? 'border-red-500 bg-red-50'
									: 'border-blue-500 bg-blue-50'
									: 'border-gray-200 bg-gray-50 hover:border-gray-300'
							}"
						>
							<div class="text-2xl mb-1">{icon}</div>
							<div class="text-sm font-medium {
								formData.category === value 
									? value === 'income' ? 'text-green-700' 
									: value === 'expense' ? 'text-red-700'
									: 'text-blue-700'
									: 'text-gray-700'
							}">{label}</div>
							{#if formData.category === value}
								<div class="absolute top-2 right-2 w-2 h-2 rounded-full {
									value === 'income' ? 'bg-green-500' 
									: value === 'expense' ? 'bg-red-500'
									: 'bg-blue-500'
								}"></div>
							{/if}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Date and Type Row -->
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="date" class="flex items-center gap-2 text-sm font-medium text-gray-700">
						<Calendar class="w-4 h-4" />
						Date & Time
					</Label>
					<Input
						id="date"
						type="datetime-local"
						bind:value={formData.date}
						class="h-11"
						required
					/>
				</div>
				
				<div class="space-y-2">
					<Label for="type" class="flex items-center gap-2 text-sm font-medium text-gray-700">
						<Hash class="w-4 h-4" />
						Category
					</Label>
					<select
						id="type"
						bind:value={formData.type}
						class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						{#each Object.entries(availableTypes) as [value, label]}
							<option {value}>{label}</option>
						{/each}
					</select>
				</div>
			</div>
			
			<!-- Description -->
			<div class="space-y-2">
				<Label for="description" class="flex items-center gap-2 text-sm font-medium text-gray-700">
					<FileText class="w-4 h-4" />
					Description
				</Label>
				<Input
					id="description"
					placeholder={descriptionPlaceholder}
					bind:value={formData.description}
					class="h-11"
					required
				/>
			</div>
			
			<!-- Amount and Account -->
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="amount" class="flex items-center gap-2 text-sm font-medium text-gray-700">
						<Wallet class="w-4 h-4" />
						Amount
					</Label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-base font-medium text-gray-500">Rp</span>
						<Input
							id="amount"
							type="text"
							placeholder="0"
							class="pl-12 h-11 text-lg font-medium"
							bind:value={formData.amount}
							oninput={(e) => {
								const target = e.currentTarget;
								const value = target.value;
								const formatted = formatNumberInput(value);
								formData.amount = value.replace(/\D/g, '');
								target.value = formatted;
							}}
							required
						/>
					</div>
				</div>
				
				{#if formData.category !== 'transfer'}
					<div class="space-y-2">
						<Label for="account" class="flex items-center gap-2 text-sm font-medium text-gray-700">
							<CreditCard class="w-4 h-4" />
							Account
						</Label>
						<select
							id="account"
							bind:value={formData.account}
							class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							required={formData.category !== 'transfer'}
						>
							<option value="">Select account</option>
							{#each availableAccounts as account}
								<option value={account.id}>
									{account.name}
									{#if account.institution}
										({account.institution})
									{/if}
								</option>
							{/each}
						</select>
					</div>
				{/if}
			</div>
			
			<!-- Transfer Accounts -->
			{#if formData.category === 'transfer'}
				<div class="space-y-4">
					<div class="flex items-center justify-center">
						<ArrowRightLeft class="w-5 h-5 text-blue-500" />
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="fromAccount" class="text-sm font-medium text-gray-700">From Account</Label>
							<select
								id="fromAccount"
								bind:value={formData.fromAccount}
								class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								required={formData.category === 'transfer'}
							>
								<option value="">Select source</option>
								{#each availableAccounts as account}
									<option value={account.id}>
										{account.name} • {formatCurrency(account.balance)}
									</option>
								{/each}
							</select>
						</div>
						
						<div class="space-y-2">
							<Label for="toAccount" class="text-sm font-medium text-gray-700">To Account</Label>
							<select
								id="toAccount"
								bind:value={formData.toAccount}
								class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								required={formData.category === 'transfer'}
							>
								<option value="">Select destination</option>
								{#each availableAccounts as account}
									<option value={account.id} disabled={account.id === formData.fromAccount}>
										{account.name} • {formatCurrency(account.balance)}
									</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
			{/if}
			
			<!-- Notes - Optional -->
			<div class="space-y-2">
				<Label for="notes" class="text-sm font-medium text-gray-700">Notes (Optional)</Label>
				<textarea
					id="notes"
					placeholder="Add any additional details..."
					bind:value={formData.notes}
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
				/>
			</div>
			
			<!-- Transaction Summary -->
			{#if formData.amount && formData.description}
				<div class="rounded-lg bg-gray-50 p-4 space-y-2">
					<div class="text-sm font-medium text-gray-700">Transaction Preview</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">{formData.description}</span>
						<span class="font-semibold {
							formData.category === 'income' ? 'text-green-600' : 
							formData.category === 'expense' ? 'text-red-600' : 
							'text-blue-600'
						}">
							{formData.category === 'income' ? '+' : formData.category === 'expense' ? '-' : ''}
							{formatCurrency(parseFloat(formData.amount) || 0)}
						</span>
					</div>
					{#if formData.category === 'transfer' && formData.fromAccount && formData.toAccount}
						<div class="text-xs text-gray-500">
							{getAccountName(formData.fromAccount)} → {getAccountName(formData.toAccount)}
						</div>
					{:else if formData.account}
						<div class="text-xs text-gray-500">
							From: {getAccountName(formData.account)}
						</div>
					{/if}
				</div>
			{/if}
			
			<Dialog.Footer class="flex gap-3 justify-end pt-4 border-t">
				<Button type="button" variant="outline" onclick={() => showAddModal = false}>
					Cancel
				</Button>
				<Button 
					type="submit" 
					class="{
						formData.category === 'income' ? 'bg-green-600 hover:bg-green-700' : 
						formData.category === 'expense' ? 'bg-red-600 hover:bg-red-700' : 
						'bg-blue-600 hover:bg-blue-700'
					}"
				>
					Add {transactionCategories[formData.category].label}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>