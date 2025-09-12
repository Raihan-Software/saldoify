<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Plus, TrendingUp, TrendingDown, Activity, Calendar, Wallet, ArrowRightLeft, FileText, Hash, CreditCard, MoreVertical, Edit, Trash2 } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import PageHeader from '$lib/components/page-header.svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import { format, isToday, isYesterday } from 'date-fns';
	import { id } from 'date-fns/locale';
	
	let { data }: { data: PageData } = $props();

	let showAddModal = $state(false);
	let showEditModal = $state(false);
	let showDeleteModal = $state(false);
	let isSubmitting = $state(false);
	let editingTransaction = $state<any>(null);
	let deletingTransaction = $state<any>(null);
	
	// Group transactions by date
	function groupTransactionsByDate(transactions: any[]) {
		const groups: Record<string, any[]> = {};
		
		transactions.forEach(transaction => {
			const date = new Date(transaction.transactionDate);
			const dateKey = date.toDateString();
			
			if (!groups[dateKey]) {
				groups[dateKey] = [];
			}
			groups[dateKey].push(transaction);
		});
		
		return groups;
	}
	
	// Calculate daily totals
	function calculateDailyTotal(transactions: any[], type: 'income' | 'expense' | 'all' = 'all') {
		return transactions.reduce((total, t) => {
			const amount = parseFloat(t.amount);
			if (type === 'all') {
				return total + (t.type === 'income' ? amount : -amount);
			}
			return t.type === type ? total + amount : total;
		}, 0);
	}
	
	
	// Format date for datetime-local input with proper timezone handling
	function formatDateForInput(date: Date | string): string {
		if (!date) return '';
		
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		
		// Simply format the date object in local time
		// The Date object already handles timezone conversion when displaying
		const year = dateObj.getFullYear();
		const month = String(dateObj.getMonth() + 1).padStart(2, '0');
		const day = String(dateObj.getDate()).padStart(2, '0');
		const hour = String(dateObj.getHours()).padStart(2, '0');
		const minute = String(dateObj.getMinutes()).padStart(2, '0');
		
		return `${year}-${month}-${day}T${hour}:${minute}`;
	}
	
	// Form state
	let formData = $state({
		date: formatDateForInput(new Date()), // Format: YYYY-MM-DDTHH:MM in local timezone
		description: '',
		category: 'expense' as 'income' | 'expense' | 'transfer',
		type: '',
		amount: '',
		account: '',
		fromAccount: '',
		toAccount: '',
		notes: ''
	});
	
	
	// Dynamic placeholders based on category
	let descriptionPlaceholder = $derived(
		formData.category === 'income' ? 'e.g., Monthly salary' :
		formData.category === 'expense' ? 'e.g., Lunch at restaurant' :
		formData.category === 'transfer' ? 'e.g., Transfer to savings' :
		'Enter description'
	);
	
	// Clear transfer fields when changing category
	$effect(() => {
		if (formData.category !== 'transfer') {
			formData.fromAccount = '';
			formData.toAccount = '';
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

	function formatTime(date: Date | string): string {
		// Use Intl.DateTimeFormat for consistent timezone handling
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		
		// Format time in user's locale and timezone
		return new Intl.DateTimeFormat('id-ID', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
			// No explicit timezone - uses user's local timezone
		}).format(dateObj);
	}
	
	function formatDate(date: Date | string): string {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		
		if (isToday(dateObj)) {
			return 'Today';
		} else if (isYesterday(dateObj)) {
			return 'Yesterday';
		} else {
			return format(dateObj, 'EEEE, d MMMM yyyy', { locale: id });
		}
	}
	
	function resetForm() {
		formData = {
			date: formatDateForInput(new Date()),
			description: '',
			category: 'expense',
			type: '',
			amount: '',
			account: '',
			fromAccount: '',
			toAccount: '',
			notes: ''
		};
	}
	
	function formatNumberInput(value: string): string {
		const digits = value.replace(/\D/g, '');
		return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
	{#await data.monthlyTotals}
		<!-- Loading skeleton for summary cards -->
		<div class="grid gap-4 md:grid-cols-3">
			{#each Array(3) as _}
				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Skeleton class="h-4 w-24" />
						<Skeleton class="h-4 w-4 rounded-full" />
					</CardHeader>
					<CardContent>
						<Skeleton class="h-8 w-32 mb-1" />
						<Skeleton class="h-3 w-28" />
					</CardContent>
				</Card>
			{/each}
		</div>
	{:then monthlyTotals}
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
					<div class="text-2xl font-bold {monthlyTotals.income - monthlyTotals.expense >= 0 ? 'text-green-600' : 'text-red-600'}">
						{formatCurrency(monthlyTotals.income - monthlyTotals.expense)}
					</div>
					<p class="text-xs text-muted-foreground mt-1">
						Income minus expenses
					</p>
				</CardContent>
			</Card>
		</div>
	{/await}

	<!-- Transactions by Day -->
	{#await data.transactions}
		<!-- Loading skeleton for transactions -->
		<div class="space-y-6">
			{#each Array(2) as _}
				<Card>
					<CardHeader class="pb-4">
						<div class="flex items-center justify-between">
							<Skeleton class="h-6 w-32" />
							<div class="flex items-center gap-4">
								<Skeleton class="h-4 w-20" />
								<Skeleton class="h-4 w-20" />
								<Skeleton class="h-4 w-24" />
							</div>
						</div>
					</CardHeader>
					<CardContent class="pt-0">
						<div class="space-y-3">
							{#each Array(3) as _}
								<div class="flex items-center justify-between p-3 rounded-lg">
									<div class="flex items-center gap-3">
										<Skeleton class="w-10 h-10 rounded-full" />
										<div>
											<Skeleton class="h-4 w-32 mb-1" />
											<Skeleton class="h-3 w-20" />
										</div>
									</div>
									<div class="text-right">
										<Skeleton class="h-5 w-24 mb-1" />
										<Skeleton class="h-3 w-16" />
									</div>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:then transactions}
		{@const groupedTransactions = groupTransactionsByDate(transactions)}
		<div class="space-y-6">
			{#if Object.keys(groupedTransactions).length === 0}
				<Card>
					<CardContent class="py-12 text-center">
						<p class="text-muted-foreground">No transactions yet. Add your first transaction!</p>
					</CardContent>
				</Card>
			{:else}
				{#each Object.entries(groupedTransactions) as [dateKey, dayTransactions]}
				<Card>
					<CardHeader class="pb-4">
						<div class="flex items-center justify-between">
							<CardTitle class="text-lg">{formatDate(dateKey)}</CardTitle>
							<div class="flex items-center gap-4 text-sm">
								<span class="text-green-600">+{formatCurrency(calculateDailyTotal(dayTransactions, 'income'))}</span>
								<span class="text-red-600">-{formatCurrency(calculateDailyTotal(dayTransactions, 'expense'))}</span>
								<span class="font-medium {calculateDailyTotal(dayTransactions) >= 0 ? 'text-green-600' : 'text-red-600'}">
									{calculateDailyTotal(dayTransactions) >= 0 ? '+' : ''}{formatCurrency(calculateDailyTotal(dayTransactions))}
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
									<TableHead class="w-[50px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each dayTransactions as transaction}
									<TableRow>
										<TableCell class="text-muted-foreground">
											{formatTime(transaction.transactionDate)}
										</TableCell>
										<TableCell class="font-medium">
											{transaction.description}
											{#if transaction.notes}
												<p class="text-xs text-muted-foreground">{transaction.notes}</p>
											{/if}
										</TableCell>
										<TableCell>
											<div class="flex items-center gap-2">
												<span class="text-lg">{transaction.type === 'income' ? '💰' : '💸'}</span>
												<div>
													<p class="text-sm font-medium">{transaction.type === 'income' ? 'Income' : 'Expense'}</p>
													<p class="text-xs text-muted-foreground">
														{transaction.category?.label || '-'}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div>
												<p class="text-sm">{transaction.account?.name || '-'}</p>
												{#if transaction.account?.bankName}
													<p class="text-xs text-muted-foreground">{transaction.account.bankName}</p>
												{/if}
											</div>
										</TableCell>
										<TableCell class="text-right">
											<span class="font-medium {transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
												{transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
											</span>
										</TableCell>
										<TableCell>
											<DropdownMenu.Root>
												<DropdownMenu.Trigger>
													<Button variant="ghost" class="h-8 w-8 p-0">
														<span class="sr-only">Open menu</span>
														<MoreVertical class="h-4 w-4" />
													</Button>
												</DropdownMenu.Trigger>
												<DropdownMenu.Content align="end">
													<DropdownMenu.Item onclick={() => {
														editingTransaction = transaction;
														formData = {
															date: formatDateForInput(transaction.transactionDate),
															description: transaction.description,
															category: transaction.type as 'income' | 'expense' | 'transfer',
															type: transaction.category?.id || '',
															amount: transaction.amount,
															account: transaction.account?.id || '',
															fromAccount: '',
															toAccount: '',
															notes: transaction.notes || ''
														};
														showEditModal = true;
													}}>
														<Edit class="mr-2 h-4 w-4" />
														<span>Edit</span>
													</DropdownMenu.Item>
													<DropdownMenu.Separator />
													<DropdownMenu.Item class="text-red-600" onclick={() => {
														deletingTransaction = transaction;
														showDeleteModal = true;
													}}>
														<Trash2 class="mr-2 h-4 w-4" />
														<span>Delete</span>
													</DropdownMenu.Item>
												</DropdownMenu.Content>
											</DropdownMenu.Root>
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
				{/each}
			{/if}
		</div>
	{/await}
</div>

{#await Promise.all([data.liquidAssets, data.transactionCategories])}
	<!-- Loading state - don't show modals while data is loading -->
{:then [liquidAssets, transactionCategories]}
	{@const availableAccounts = liquidAssets.map(asset => ({
		id: asset.id,
		name: asset.name,
		institution: asset.bankName,
		balance: parseFloat(asset.currentValue)
	}))}

	<!-- Add Transaction Modal -->
<Dialog.Root bind:open={showAddModal}>
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>New Transaction</Dialog.Title>
			<Dialog.Description>
				Record your income, expense, or transfer
			</Dialog.Description>
		</Dialog.Header>
		
		<form 
			method="POST" 
			action="?/create"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						showAddModal = false;
						resetForm();
						await invalidateAll();
					}
				};
			}}
			class="space-y-6 mt-6"
		>
			<!-- Category Selection - Visual Cards -->
			<div class="space-y-2">
				<Label class="text-sm font-medium text-gray-700">Transaction Type</Label>
				<input type="hidden" name="type" value={formData.category} />
				<div class="grid grid-cols-3 gap-3">
					{#each [['income', '💰', 'Income'], ['expense', '💸', 'Expense'], ['transfer', '🔄', 'Transfer']] as [value, icon, label]}
						<button
							type="button"
							onclick={() => formData.category = value as 'income' | 'expense' | 'transfer'}
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
						name="transactionDate"
						type="datetime-local"
						bind:value={formData.date}
						class="h-11"
						required
					/>
					<!-- Hidden field to send timezone offset -->
					<input type="hidden" name="timezoneOffset" value={new Date().getTimezoneOffset()} />
				</div>
				
				<div class="space-y-2">
					<Label for="type" class="flex items-center gap-2 text-sm font-medium text-gray-700">
						<Hash class="w-4 h-4" />
						Category
					</Label>
					<select
						id="type"
						name="categoryId"
						bind:value={formData.type}
						class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						required
					>
						<option value="">Select category</option>
						{#each (formData.category === 'income' ? transactionCategories.income : formData.category === 'expense' ? transactionCategories.expense : formData.category === 'transfer' ? transactionCategories.transfer : []) as category}
							<option value={category.id}>{category.label}</option>
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
					name="description"
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
							name="amount"
							type="text"
							placeholder="0"
							class="pl-12 h-11 text-lg font-medium"
							bind:value={formData.amount}
							oninput={(e) => {
								const target = e.currentTarget;
								const value = target.value;
								formData.amount = value.replace(/\D/g, '');
								target.value = value;
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
							name="assetId"
							bind:value={formData.account}
							class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							required={formData.category !== 'transfer' as any}
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
								name="fromAccount"
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
								name="toAccount"
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
					name="notes"
					placeholder="Add any additional details..."
					bind:value={formData.notes}
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
				></textarea>
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
							{formData.fromAccount} → {formData.toAccount}
						</div>
					{:else if formData.account}
						<div class="text-xs text-gray-500">
							From: {formData.account}
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
					disabled={isSubmitting}
					class={
						formData.category === 'income' ? 'bg-green-600 hover:bg-green-700' : 
						formData.category === 'expense' ? 'bg-red-600 hover:bg-red-700' : 
						'bg-blue-600 hover:bg-blue-700'
					}
				>
					{isSubmitting ? 'Adding...' : `Add ${formData.category === 'income' ? 'Income' : formData.category === 'expense' ? 'Expense' : 'Transfer'}`}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Transaction Modal -->
<Dialog.Root bind:open={showEditModal}>
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>Edit Transaction</Dialog.Title>
			<Dialog.Description>
				Update your transaction details
			</Dialog.Description>
		</Dialog.Header>
		
		<form 
			method="POST" 
			action="?/update"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						showEditModal = false;
						editingTransaction = null;
						resetForm();
						await invalidateAll();
					}
				};
			}}
			class="space-y-6 mt-6"
		>
			<input type="hidden" name="id" value={editingTransaction?.id} />
			
			<!-- Category Selection - Visual Cards -->
			<div class="space-y-2">
				<Label class="text-sm font-medium text-gray-700">Transaction Type</Label>
				<input type="hidden" name="type" value={formData.category} />
				<div class="grid grid-cols-2 gap-3">
					{#each [['income', '💰', 'Income'], ['expense', '💸', 'Expense']] as [value, icon, label]}
						<button
							type="button"
							onclick={() => formData.category = value as 'income' | 'expense' | 'transfer'}
							class="relative p-4 rounded-lg border-2 transition-all duration-200 {
								formData.category === value 
									? value === 'income' ? 'border-green-500 bg-green-50' 
									: 'border-red-500 bg-red-50'
									: 'border-gray-200 bg-gray-50 hover:border-gray-300'
							}"
						>
							<div class="text-2xl mb-1">{icon}</div>
							<div class="text-sm font-medium {
								formData.category === value 
									? value === 'income' ? 'text-green-700' 
									: 'text-red-700'
									: 'text-gray-700'
							}">{label}</div>
							{#if formData.category === value}
								<div class="absolute top-2 right-2 w-2 h-2 rounded-full {
									value === 'income' ? 'bg-green-500' 
									: 'bg-red-500'
								}"></div>
							{/if}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Date and Type Row -->
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-date" class="flex items-center gap-2 text-sm font-medium text-gray-700">
						<Calendar class="w-4 h-4" />
						Date & Time
					</Label>
					<Input
						id="edit-date"
						name="transactionDate"
						type="datetime-local"
						bind:value={formData.date}
						class="h-11"
						required
					/>
					<!-- Hidden field to send timezone offset -->
					<input type="hidden" name="timezoneOffset" value={new Date().getTimezoneOffset()} />
				</div>
				
				<div class="space-y-2">
					<Label for="edit-type" class="flex items-center gap-2 text-sm font-medium text-gray-700">
						<Hash class="w-4 h-4" />
						Category
					</Label>
					<select
						id="edit-type"
						name="categoryId"
						bind:value={formData.type}
						class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						required
					>
						<option value="">Select category</option>
						{#each (formData.category === 'income' ? transactionCategories.income : formData.category === 'expense' ? transactionCategories.expense : formData.category === 'transfer' ? transactionCategories.transfer : []) as category}
							<option value={category.id}>{category.label}</option>
						{/each}
					</select>
				</div>
			</div>
			
			<!-- Description -->
			<div class="space-y-2">
				<Label for="edit-description" class="flex items-center gap-2 text-sm font-medium text-gray-700">
					<FileText class="w-4 h-4" />
					Description
				</Label>
				<Input
					id="edit-description"
					name="description"
					placeholder={descriptionPlaceholder}
					bind:value={formData.description}
					class="h-11"
					required
				/>
			</div>
			
			<!-- Amount and Account -->
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-amount" class="flex items-center gap-2 text-sm font-medium text-gray-700">
						<Wallet class="w-4 h-4" />
						Amount
					</Label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-base font-medium text-gray-500">Rp</span>
						<Input
							id="edit-amount"
							name="amount"
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
				
				<div class="space-y-2">
					<Label for="edit-account" class="flex items-center gap-2 text-sm font-medium text-gray-700">
						<CreditCard class="w-4 h-4" />
						Account
					</Label>
					<select
						id="edit-account"
						name="assetId"
						bind:value={formData.account}
						class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						required
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
			</div>
			
			<!-- Notes - Optional -->
			<div class="space-y-2">
				<Label for="edit-notes" class="text-sm font-medium text-gray-700">Notes (Optional)</Label>
				<textarea
					id="edit-notes"
					name="notes"
					placeholder="Add any additional details..."
					bind:value={formData.notes}
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
				></textarea>
			</div>
			
			<Dialog.Footer class="flex gap-3 justify-end pt-4 border-t">
				<Button type="button" variant="outline" onclick={() => {
					showEditModal = false;
					editingTransaction = null;
					resetForm();
				}}>
					Cancel
				</Button>
				<Button 
					type="submit" 
					disabled={isSubmitting}
					class="{
						formData.category === 'income' ? 'bg-green-600 hover:bg-green-700' : 
						'bg-red-600 hover:bg-red-700'
					}"
				>
					{isSubmitting ? 'Updating...' : 'Update Transaction'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation Modal -->
<Dialog.Root bind:open={showDeleteModal}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Delete Transaction</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this transaction? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		
		{#if deletingTransaction}
			<div class="my-4 p-4 bg-gray-50 rounded-lg">
				<p class="font-medium">{deletingTransaction.description}</p>
				<p class="text-sm text-muted-foreground mt-1">
					<span class="{deletingTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
						{deletingTransaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(deletingTransaction.amount))}
					</span>
					• {deletingTransaction.category?.label}
				</p>
			</div>
		{/if}
		
		<Dialog.Footer class="flex gap-3 justify-end">
			<Button variant="outline" onclick={() => {
				showDeleteModal = false;
				deletingTransaction = null;
			}}>
				Cancel
			</Button>
			<form 
				method="POST" 
				action="?/delete"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ result }) => {
						isSubmitting = false;
						if (result.type === 'success') {
							showDeleteModal = false;
							deletingTransaction = null;
							await invalidateAll();
						}
					};
				}}
			>
				<input type="hidden" name="id" value={deletingTransaction?.id} />
				<Button 
					type="submit" 
					variant="destructive"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Deleting...' : 'Delete Transaction'}
				</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
{/await}