<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { LiquidAsset } from '../types';

	interface Props {
		assets: LiquidAsset[];
	}

	let { assets }: Props = $props();

	let totalCurrentBalance = $derived(assets.reduce((sum, asset) => sum + asset.currentBalance, 0));
	let totalStartingBalance = $derived(assets.reduce((sum, asset) => sum + asset.startingBalance, 0));
	let totalChange = $derived(totalCurrentBalance - totalStartingBalance);
	let percentageChange = $derived(totalStartingBalance > 0 ? (totalChange / totalStartingBalance) * 100 : 0);

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>Total Liquid Assets</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="space-y-4">
			<div>
				<p class="text-3xl font-bold">{formatCurrency(totalCurrentBalance)}</p>
				<p class="text-sm text-muted-foreground mt-1">
					Total across {assets.length} accounts
				</p>
			</div>
			<div class="grid grid-cols-2 gap-4 pt-4 border-t">
				<div>
					<p class="text-sm text-muted-foreground">Monthly Change</p>
					<p class={`text-lg font-semibold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
						{totalChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalChange))}
					</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Percentage</p>
					<p class={`text-lg font-semibold ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
						{percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
					</p>
				</div>
			</div>
		</div>
	</CardContent>
</Card>