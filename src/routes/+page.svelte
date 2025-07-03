<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
</script>

<div class="container mx-auto p-6 max-w-7xl">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">Dashboard</h1>
		<p class="text-muted-foreground">Welcome to your personal finance dashboard</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="pb-3">
				<CardTitle class="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">Rp 242.000.000</p>
				<p class="text-xs text-muted-foreground mt-1">+12.5% from last month</p>
			</CardContent>
		</Card>
		
		<Card>
			<CardHeader class="pb-3">
				<CardTitle class="text-sm font-medium text-muted-foreground">Monthly Income</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">Rp 8.500.000</p>
				<p class="text-xs text-muted-foreground mt-1">+2.1% from last month</p>
			</CardContent>
		</Card>
		
		<Card>
			<CardHeader class="pb-3">
				<CardTitle class="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">Rp 5.200.000</p>
				<p class="text-xs text-muted-foreground mt-1">-5.4% from last month</p>
			</CardContent>
		</Card>
		
		<Card>
			<CardHeader class="pb-3">
				<CardTitle class="text-sm font-medium text-muted-foreground">Savings Rate</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">40.7%</p>
				<p class="text-xs text-muted-foreground mt-1">+3.2% from last month</p>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-6 mt-6 md:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>Recent Transactions</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-muted-foreground">No recent transactions</p>
			</CardContent>
		</Card>
		
		<Card>
			<CardHeader>
				<CardTitle>Budget Overview</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-muted-foreground">No budgets set up yet</p>
			</CardContent>
		</Card>
	</div>
</div>