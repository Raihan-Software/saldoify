<script lang="ts">
	import { cn } from "$lib/utils";
	import type { HTMLTextareaAttributes } from "svelte/elements";

	type Props = HTMLTextareaAttributes & {
		value?: string;
	};

	let {
		class: className,
		value = $bindable(),
		...restProps
	}: Props = $props();
</script>

<textarea
	class={cn(
		"flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	bind:value
	{...restProps}
></textarea>