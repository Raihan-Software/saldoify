<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import type { LiquidAsset } from '../types';
	import { assetTypes } from './mock-data';

	interface Props {
		asset: LiquidAsset;
	}

	let { asset }: Props = $props();

	let assetTypeInfo = $derived(assetTypes.find((t) => t.value === asset.type));
	let percentageChange = $derived(((asset.currentBalance - asset.startingBalance) / asset.startingBalance) * 100);
	let isPositive = $derived(percentageChange >= 0);

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}
</script>

<Card class="hover:shadow-md transition-shadow">
	<CardHeader>
		<div class="flex items-center justify-between">
			<CardTitle class="text-lg">{asset.title}</CardTitle>
			<Badge variant="secondary">{assetTypeInfo?.label}</Badge>
		</div>
	</CardHeader>
	<CardContent>
		<div class="space-y-4">
			<div class="flex justify-between items-end">
				<div>
					<p class="text-sm text-muted-foreground">Current Balance</p>
					<p class="text-2xl font-bold">{formatCurrency(asset.currentBalance)}</p>
				</div>
				<div class="text-right">
					<p class="text-sm text-muted-foreground">Monthly Change</p>
					<p class={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
						{isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
					</p>
				</div>
			</div>
			<div class="pt-2 border-t">
				<div class="flex justify-between text-sm">
					<span class="text-muted-foreground">Starting Balance</span>
					<span>{formatCurrency(asset.startingBalance)}</span>
				</div>
			</div>
		</div>
	</CardContent>
</Card>