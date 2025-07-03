<script lang="ts">
	import '../app.css';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import { SidebarProvider, SidebarInset, SidebarTrigger } from '$lib/components/ui/sidebar';

	let { children } = $props();
</script>

<SidebarProvider>
	<div class="flex h-screen w-full">
		<AppSidebar />
		<SidebarInset>
			<header class="flex h-14 items-center gap-4 border-b px-6">
				<SidebarTrigger />
			</header>
			<main class="flex-1 overflow-y-auto">
				{@render children()}
			</main>
		</SidebarInset>
	</div>
</SidebarProvider>