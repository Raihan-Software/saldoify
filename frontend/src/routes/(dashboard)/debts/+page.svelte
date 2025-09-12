<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, CreditCard, Home, Car, FileText, TrendingDown, Calendar, Edit, Trash2 } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import PageHeader from '$lib/components/page-header.svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import type { Debt, DebtType } from '$lib/server/db/schema';

	let { data }: { data: PageData } = $props();

	let showAddModal = $state(false);
	let showEditModal = $state(false);
	let showDeleteModal = $state(false);
	let isSubmitting = $state(false);
	let editingDebt = $state<Debt | null>(null);
	let deletingDebt = $state<Debt | null>(null);
	
	// Calculate totals
	let totalDebt = $derived(data.debts.reduce((sum, debt) => sum + parseFloat(debt.balance), 0));
	let totalMonthlyPayment = $derived(data.debts.reduce((sum, debt) => sum + (parseFloat(debt.monthlyPayment || '0') || 0), 0));
	let totalOriginal = $derived(data.debts.reduce((sum, debt) => sum + (parseFloat(debt.originalAmount || debt.balance) || 0), 0));
	let totalPaidOff = $derived(totalOriginal - totalDebt);
	let paidOffPercentage = $derived(totalOriginal > 0 ? (totalPaidOff / totalOriginal) * 100 : 0);
	let averageInterestRate = $derived(
		data.debts.length > 0
			? data.debts.reduce((sum, d) => sum + (parseFloat(d.interestRate || '0') || 0), 0) / 
			  data.debts.filter(d => d.interestRate).length || 0
			: 0
	);
	
	// Form state
	let formData = $state({
		name: '',
		debtTypeId: '',
		balance: '',
		originalAmount: '',
		interestRate: '',
		monthlyPayment: '',
		startDate: '',
		dueDate: '',
		notes: ''
	});
	
	// Set default debt type when component mounts
	$effect(() => {
		if (data.debtTypes.length > 0 && !formData.debtTypeId) {
			formData.debtTypeId = data.debtTypes[0].id;
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
	
	function formatNumberInput(value: string): string {
		const digits = value.replace(/\D/g, '');
		return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	}
	
	function getDebtProgress(debt: Debt): number {
		if (!debt.originalAmount) return 0;
		const original = parseFloat(debt.originalAmount);
		const balance = parseFloat(debt.balance);
		return ((original - balance) / original) * 100;
	}
	
	function resetForm() {
		formData = {
			name: '',
			debtTypeId: data.debtTypes.length > 0 ? data.debtTypes[0].id : '',
			balance: '',
			originalAmount: '',
			interestRate: '',
			monthlyPayment: '',
			startDate: '',
			dueDate: '',
			notes: ''
		};
	}
	
	function formatDateForInput(date: Date | string | null): string {
		if (!date) return '';
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		// Format as YYYY-MM-DD for date input
		return dateObj.toISOString().split('T')[0];
	}
	
	function openEditModal(debt: Debt) {
		editingDebt = debt;
		formData = {
			name: debt.name,
			debtTypeId: debt.debtTypeId,
			balance: Math.floor(parseFloat(debt.balance)).toString(), // Parse as float and remove decimals
			originalAmount: debt.originalAmount ? Math.floor(parseFloat(debt.originalAmount)).toString() : '',
			interestRate: debt.interestRate || '',
			monthlyPayment: debt.monthlyPayment ? Math.floor(parseFloat(debt.monthlyPayment)).toString() : '',
			startDate: formatDateForInput(debt.startDate),
			dueDate: formatDateForInput(debt.dueDate),
			notes: debt.notes || ''
		};
		showEditModal = true;
	}
	
	function openDeleteModal(debt: Debt) {
		deletingDebt = debt;
		showDeleteModal = true;
	}
</script>

<div class="p-8 space-y-8">
	<!-- Header -->
	<PageHeader 
		title="Debt Management"
		description="Track and manage your liabilities"
		actionLabel="Add Debt"
		actionIcon={Plus}
		onAction={() => showAddModal = true}
	/>

	<!-- Hero Debt Summary Card -->
	<Card class="relative overflow-hidden border-0 bg-gradient-to-br from-red-600 to-orange-600 text-white">
		<CardContent class="p-8">
			<div class="relative z-10">
				<p class="text-lg font-medium mb-4">Total Outstanding Debt</p>
				<p class="text-5xl font-bold mb-8">{formatCurrency(totalDebt)}</p>
				
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div>
						<p class="text-sm opacity-90 mb-1">Monthly Payments</p>
						<p class="text-xl font-semibold">{formatCurrency(totalMonthlyPayment)}</p>
					</div>
					<div>
						<p class="text-sm opacity-90 mb-1">Original Amount</p>
						<p class="text-xl font-semibold">{formatCurrency(totalOriginal)}</p>
					</div>
					<div>
						<p class="text-sm opacity-90 mb-1">Amount Paid Off</p>
						<p class="text-xl font-semibold">{formatCurrency(totalPaidOff)}</p>
					</div>
					<div>
						<p class="text-sm opacity-90 mb-1">Progress</p>
						<p class="text-xl font-semibold">{paidOffPercentage.toFixed(1)}%</p>
					</div>
				</div>
			</div>
			<!-- Background decoration -->
			<div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
			<div class="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
		</CardContent>
	</Card>

	<!-- Quick Stats -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<Card class="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
			<CardContent class="p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Active Debts</p>
						<p class="text-2xl font-bold text-purple-800 dark:text-purple-200">{data.debts.length}</p>
					</div>
					<FileText class="h-8 w-8 text-purple-500 opacity-50" />
				</div>
			</CardContent>
		</Card>
		
		<Card class="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
			<CardContent class="p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Avg Interest Rate</p>
						<p class="text-2xl font-bold text-blue-800 dark:text-blue-200">
							{averageInterestRate.toFixed(1)}%
						</p>
					</div>
					<TrendingDown class="h-8 w-8 text-blue-500 opacity-50" />
				</div>
			</CardContent>
		</Card>
		
		<Card class="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
			<CardContent class="p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Paid Off</p>
						<p class="text-2xl font-bold text-green-800 dark:text-green-200">{paidOffPercentage.toFixed(1)}%</p>
					</div>
					<Calendar class="h-8 w-8 text-green-500 opacity-50" />
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Debts Table -->
	<Card>
		<CardHeader>
			<CardTitle>All Debts</CardTitle>
			<CardDescription>
				Track and manage your outstanding liabilities
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if data.debts.length > 0}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Type</TableHead>
							<TableHead class="text-right">Balance</TableHead>
							<TableHead class="text-right">Original</TableHead>
							<TableHead class="text-center">Interest</TableHead>
							<TableHead class="text-right">Monthly</TableHead>
							<TableHead>Progress</TableHead>
							<TableHead class="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each data.debts as debt}
							<TableRow>
								<TableCell class="font-medium">
									{debt.name}
									{#if debt.notes}
										<p class="text-xs text-muted-foreground">{debt.notes}</p>
									{/if}
								</TableCell>
								<TableCell>
									<Badge variant="secondary">
										{debt.debtType?.icon} {debt.debtType?.label}
									</Badge>
								</TableCell>
								<TableCell class="text-right font-semibold text-red-600">
									{formatCurrency(parseFloat(debt.balance))}
								</TableCell>
								<TableCell class="text-right">
									{debt.originalAmount ? formatCurrency(parseFloat(debt.originalAmount)) : '-'}
								</TableCell>
								<TableCell class="text-center">
									{debt.interestRate ? `${debt.interestRate}%` : '-'}
								</TableCell>
								<TableCell class="text-right">
									{debt.monthlyPayment ? formatCurrency(parseFloat(debt.monthlyPayment)) : '-'}
								</TableCell>
								<TableCell>
									{#if debt.originalAmount}
										<div class="space-y-1">
											<div class="flex justify-between text-xs">
												<span>{getDebtProgress(debt).toFixed(0)}%</span>
											</div>
											<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
												<div 
													class="bg-green-500 h-1.5 rounded-full transition-all duration-500" 
													style="width: {getDebtProgress(debt)}%"
												></div>
											</div>
										</div>
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</TableCell>
								<TableCell class="text-right">
									<div class="flex justify-end gap-2">
										<Button variant="ghost" size="icon" onclick={() => openEditModal(debt)}>
											<Edit class="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="icon" onclick={() => openDeleteModal(debt)}>
											<Trash2 class="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{:else}
				<div class="text-center py-12">
					<CreditCard class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
					<p class="text-lg font-medium mb-2">No debts tracked</p>
					<p class="text-muted-foreground mb-4">Start by adding your first debt to track</p>
					<Button onclick={() => showAddModal = true}>
						<Plus class="mr-2 h-4 w-4" />
						Add Your First Debt
					</Button>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

<!-- Add Debt Modal -->
<Dialog.Root bind:open={showAddModal}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Add New Debt</Dialog.Title>
			<Dialog.Description>
				Track a new loan, mortgage, or credit card debt.
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
			class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Debt Name *</Label>
				<Input
					id="name"
					name="name"
					placeholder="e.g., Home Mortgage - BCA"
					bind:value={formData.name}
					required
				/>
			</div>
			
			<div class="space-y-2">
				<Label for="debtTypeId">Debt Type *</Label>
				<select
					id="debtTypeId"
					name="debtTypeId"
					bind:value={formData.debtTypeId}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					required
				>
					{#each data.debtTypes as debtType}
						<option value={debtType.id}>{debtType.icon} {debtType.label}</option>
					{/each}
				</select>
			</div>
			
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="balance">Current Balance *</Label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
						<input type="hidden" name="balance" value={formData.balance} />
						<Input
							id="balance"
							type="text"
							placeholder="0"
							class="pl-10"
							value={formatNumberInput(formData.balance)}
							oninput={(e) => {
								const target = e.currentTarget;
								const value = target.value;
								formData.balance = value.replace(/\D/g, '');
								target.value = formatNumberInput(formData.balance);
							}}
							required
						/>
					</div>
				</div>
				
				<div class="space-y-2">
					<Label for="originalAmount">Original Amount</Label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
						<input type="hidden" name="originalAmount" value={formData.originalAmount} />
						<Input
							id="originalAmount"
							type="text"
							placeholder="0"
							class="pl-10"
							value={formatNumberInput(formData.originalAmount)}
							oninput={(e) => {
								const target = e.currentTarget;
								const value = target.value;
								formData.originalAmount = value.replace(/\D/g, '');
								target.value = formatNumberInput(formData.originalAmount);
							}}
						/>
					</div>
				</div>
			</div>
			
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="interestRate">Interest Rate (% APR)</Label>
					<Input
						id="interestRate"
						name="interestRate"
						type="number"
						step="0.1"
						placeholder="e.g., 7.5"
						bind:value={formData.interestRate}
					/>
				</div>
				
				<div class="space-y-2">
					<Label for="monthlyPayment">Monthly Payment</Label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
						<input type="hidden" name="monthlyPayment" value={formData.monthlyPayment} />
						<Input
							id="monthlyPayment"
							type="text"
							placeholder="0"
							class="pl-10"
							value={formatNumberInput(formData.monthlyPayment)}
							oninput={(e) => {
								const target = e.currentTarget;
								const value = target.value;
								formData.monthlyPayment = value.replace(/\D/g, '');
								target.value = formatNumberInput(formData.monthlyPayment);
							}}
						/>
					</div>
				</div>
			</div>
			
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="startDate">Start Date</Label>
					<Input
						id="startDate"
						name="startDate"
						type="date"
						bind:value={formData.startDate}
					/>
				</div>
				
				<div class="space-y-2">
					<Label for="dueDate">Due Date</Label>
					<Input
						id="dueDate"
						name="dueDate"
						type="date"
						bind:value={formData.dueDate}
					/>
				</div>
			</div>
			
			<div class="space-y-2">
				<Label for="notes">Notes</Label>
				<textarea
					id="notes"
					name="notes"
					placeholder="Additional details..."
					bind:value={formData.notes}
					class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				></textarea>
			</div>
			
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => showAddModal = false}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Adding...' : 'Add Debt'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Debt Modal -->
<Dialog.Root bind:open={showEditModal}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Edit Debt</Dialog.Title>
			<Dialog.Description>
				Update your debt information.
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
						editingDebt = null;
						resetForm();
						await invalidateAll();
					}
				};
			}}
			class="space-y-4">
			<input type="hidden" name="id" value={editingDebt?.id} />
			
			<div class="space-y-2">
				<Label for="edit-name">Debt Name *</Label>
				<Input
					id="edit-name"
					name="name"
					placeholder="e.g., Home Mortgage - BCA"
					bind:value={formData.name}
					required
				/>
			</div>
			
			<div class="space-y-2">
				<Label for="edit-debtTypeId">Debt Type *</Label>
				<select
					id="edit-debtTypeId"
					name="debtTypeId"
					bind:value={formData.debtTypeId}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					required
				>
					{#each data.debtTypes as debtType}
						<option value={debtType.id}>{debtType.icon} {debtType.label}</option>
					{/each}
				</select>
			</div>
			
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-balance">Current Balance *</Label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
						<input type="hidden" name="balance" value={formData.balance} />
						<Input
							id="edit-balance"
							type="text"
							placeholder="0"
							class="pl-10"
							value={formatNumberInput(formData.balance)}
							oninput={(e) => {
								const target = e.currentTarget;
								const value = target.value;
								formData.balance = value.replace(/\D/g, '');
								target.value = formatNumberInput(formData.balance);
							}}
							required
						/>
					</div>
				</div>
				
				<div class="space-y-2">
					<Label for="edit-originalAmount">Original Amount</Label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
						<input type="hidden" name="originalAmount" value={formData.originalAmount} />
						<Input
							id="edit-originalAmount"
							type="text"
							placeholder="0"
							class="pl-10"
							value={formatNumberInput(formData.originalAmount)}
							oninput={(e) => {
								const target = e.currentTarget;
								const value = target.value;
								formData.originalAmount = value.replace(/\D/g, '');
								target.value = formatNumberInput(formData.originalAmount);
							}}
						/>
					</div>
				</div>
			</div>
			
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-interestRate">Interest Rate (% APR)</Label>
					<Input
						id="edit-interestRate"
						name="interestRate"
						type="number"
						step="0.1"
						placeholder="e.g., 7.5"
						bind:value={formData.interestRate}
					/>
				</div>
				
				<div class="space-y-2">
					<Label for="edit-monthlyPayment">Monthly Payment</Label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
						<input type="hidden" name="monthlyPayment" value={formData.monthlyPayment} />
						<Input
							id="edit-monthlyPayment"
							type="text"
							placeholder="0"
							class="pl-10"
							value={formatNumberInput(formData.monthlyPayment)}
							oninput={(e) => {
								const target = e.currentTarget;
								const value = target.value;
								formData.monthlyPayment = value.replace(/\D/g, '');
								target.value = formatNumberInput(formData.monthlyPayment);
							}}
						/>
					</div>
				</div>
			</div>
			
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-startDate">Start Date</Label>
					<Input
						id="edit-startDate"
						name="startDate"
						type="date"
						bind:value={formData.startDate}
					/>
				</div>
				
				<div class="space-y-2">
					<Label for="edit-dueDate">Due Date</Label>
					<Input
						id="edit-dueDate"
						name="dueDate"
						type="date"
						bind:value={formData.dueDate}
					/>
				</div>
			</div>
			
			<div class="space-y-2">
				<Label for="edit-notes">Notes</Label>
				<textarea
					id="edit-notes"
					name="notes"
					placeholder="Additional details..."
					bind:value={formData.notes}
					class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				></textarea>
			</div>
			
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => {
					showEditModal = false;
					editingDebt = null;
					resetForm();
				}}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Updating...' : 'Update Debt'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation Modal -->
<Dialog.Root bind:open={showDeleteModal}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Delete Debt</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this debt? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		
		{#if deletingDebt}
			<div class="my-4 p-4 bg-gray-50 rounded-lg">
				<p class="font-medium">{deletingDebt.name}</p>
				<p class="text-sm text-muted-foreground mt-1">
					Balance: {formatCurrency(parseFloat(deletingDebt.balance))}
				</p>
			</div>
		{/if}
		
		<Dialog.Footer>
			<Button variant="outline" onclick={() => {
				showDeleteModal = false;
				deletingDebt = null;
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
							deletingDebt = null;
							await invalidateAll();
						}
					};
				}}
			>
				<input type="hidden" name="id" value={deletingDebt?.id} />
				<Button 
					type="submit" 
					variant="destructive"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Deleting...' : 'Delete Debt'}
				</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>