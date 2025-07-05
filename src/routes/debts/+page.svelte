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
	import { mockLiabilities, liabilityTypes, type Liability } from '$lib/modules/networth/networth-data';

	let debts = $state([...mockLiabilities]);
	let showAddModal = $state(false);
	
	// Calculate totals
	let totalDebt = $derived(debts.reduce((sum, debt) => sum + debt.balance, 0));
	let totalMonthlyPayment = $derived(debts.reduce((sum, debt) => sum + (debt.monthlyPayment || 0), 0));
	let totalOriginal = $derived(debts.reduce((sum, debt) => sum + (debt.originalAmount || debt.balance), 0));
	let totalPaidOff = $derived(totalOriginal - totalDebt);
	let paidOffPercentage = $derived(totalOriginal > 0 ? (totalPaidOff / totalOriginal) * 100 : 0);
	
	// Form state
	let formData = $state({
		name: '',
		type: 'personal-loan' as Liability['type'],
		balance: '',
		originalAmount: '',
		interestRate: '',
		monthlyPayment: '',
		notes: ''
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
	
	function getDebtProgress(debt: Liability): number {
		if (!debt.originalAmount) return 0;
		return ((debt.originalAmount - debt.balance) / debt.originalAmount) * 100;
	}
	
	function handleAddDebt() {
		if (!formData.name || !formData.balance) return;
		
		const newDebt: Liability = {
			id: Date.now().toString(),
			name: formData.name,
			type: formData.type,
			balance: parseFloat(formData.balance),
			originalAmount: formData.originalAmount ? parseFloat(formData.originalAmount) : undefined,
			interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
			monthlyPayment: formData.monthlyPayment ? parseFloat(formData.monthlyPayment) : undefined,
			notes: formData.notes || undefined
		};
		
		debts = [...debts, newDebt];
		
		// Reset form
		formData = {
			name: '',
			type: 'personal-loan',
			balance: '',
			originalAmount: '',
			interestRate: '',
			monthlyPayment: '',
			notes: ''
		};
		
		showAddModal = false;
	}
	
	function deleteDebt(id: string) {
		debts = debts.filter(debt => debt.id !== id);
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
						<p class="text-2xl font-bold text-purple-800 dark:text-purple-200">{debts.length}</p>
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
							{(debts.reduce((sum, d) => sum + (d.interestRate || 0), 0) / debts.filter(d => d.interestRate).length || 0).toFixed(1)}%
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
			{#if debts.length > 0}
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
						{#each debts as debt}
							<TableRow>
								<TableCell class="font-medium">
									{debt.name}
									{#if debt.notes}
										<p class="text-xs text-muted-foreground">{debt.notes}</p>
									{/if}
								</TableCell>
								<TableCell>
									<Badge variant="secondary">
										{liabilityTypes[debt.type]?.icon} {liabilityTypes[debt.type]?.label}
									</Badge>
								</TableCell>
								<TableCell class="text-right font-semibold text-red-600">
									{formatCurrency(debt.balance)}
								</TableCell>
								<TableCell class="text-right">
									{debt.originalAmount ? formatCurrency(debt.originalAmount) : '-'}
								</TableCell>
								<TableCell class="text-center">
									{debt.interestRate ? `${debt.interestRate}%` : '-'}
								</TableCell>
								<TableCell class="text-right">
									{debt.monthlyPayment ? formatCurrency(debt.monthlyPayment) : '-'}
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
										<Button variant="ghost" size="icon">
											<Edit class="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="icon" onclick={() => deleteDebt(debt.id)}>
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
		
		<form onsubmit={(e) => { e.preventDefault(); handleAddDebt(); }} class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Debt Name *</Label>
				<Input
					id="name"
					placeholder="e.g., Home Mortgage - BCA"
					bind:value={formData.name}
					required
				/>
			</div>
			
			<div class="space-y-2">
				<Label for="type">Debt Type *</Label>
				<select
					id="type"
					bind:value={formData.type}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					{#each Object.entries(liabilityTypes) as [value, { label, icon }]}
						<option {value}>{icon} {label}</option>
					{/each}
				</select>
			</div>
			
			<div class="grid grid-cols-2 gap-4">
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
					<Label for="originalAmount">Original Amount</Label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
						<Input
							id="originalAmount"
							type="text"
							placeholder="0"
							class="pl-10"
							bind:value={formData.originalAmount}
							oninput={(e) => {
								const target = e.currentTarget;
								const value = target.value;
								const formatted = formatNumberInput(value);
								formData.originalAmount = value.replace(/\D/g, '');
								target.value = formatted;
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
						<Input
							id="monthlyPayment"
							type="text"
							placeholder="0"
							class="pl-10"
							bind:value={formData.monthlyPayment}
							oninput={(e) => {
								const target = e.currentTarget;
								const value = target.value;
								const formatted = formatNumberInput(value);
								formData.monthlyPayment = value.replace(/\D/g, '');
								target.value = formatted;
							}}
						/>
					</div>
				</div>
			</div>
			
			<div class="space-y-2">
				<Label for="notes">Notes</Label>
				<textarea
					id="notes"
					placeholder="Additional details..."
					bind:value={formData.notes}
					class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				/>
			</div>
			
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => showAddModal = false}>
					Cancel
				</Button>
				<Button type="submit">
					Add Debt
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>