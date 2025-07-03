<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import LiquidAssetCard from '$lib/modules/assets/liquid/liquid-asset-card.svelte';
	import LiquidAssetsSummary from '$lib/modules/assets/liquid/liquid-assets-summary.svelte';
	import { mockLiquidAssets } from '$lib/modules/assets/liquid/mock-data';
	
	let liquidAssets = $state([...mockLiquidAssets]);
</script>

<div class="container mx-auto p-6 max-w-7xl">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">Assets</h1>
		<p class="text-muted-foreground">Manage and track your financial assets</p>
	</div>

	<div class="mb-8">
		<LiquidAssetsSummary assets={liquidAssets} />
	</div>

	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-2xl font-semibold">Liquid Assets</h2>
		<Button>
			Add Asset
		</Button>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each liquidAssets as asset}
			<LiquidAssetCard {asset} />
		{/each}
	</div>

	{#if liquidAssets.length === 0}
		<div class="text-center py-12">
			<p class="text-muted-foreground mb-4">No liquid assets added yet</p>
			<Button>Add your first asset</Button>
		</div>
	{/if}
</div>