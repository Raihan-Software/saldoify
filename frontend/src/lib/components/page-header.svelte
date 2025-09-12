<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';

	export let title: string;
	export let description: string;
	export let actionLabel: string = 'Add Asset';
	export let actionIcon: any = Plus;
	export let onAction: () => void = () => {};
	export let showAction: boolean = true;
</script>

<div class="flex items-center justify-between">
	<div class="mb-8">
		<h1 class="text-4xl font-bold text-gray-900 dark:text-white">{title}</h1>
		<p class="text-muted-foreground mt-2">{description}</p>
	</div>
	{#if showAction}
		<Button onclick={onAction}>
			<svelte:component this={actionIcon} class="mr-2 h-4 w-4" />
			{actionLabel}
		</Button>
	{/if}
</div> 