<script lang="ts">
	import '../app.css';
	import AppSidebar from '$lib/components/app-sidebar.svelte';

	let { children } = $props();
</script>

<div class="flex h-screen">
	<AppSidebar />
	
	<!-- Main content area -->
	<div class="flex-1 lg:ml-64">
		<!-- Optional header -->
		<header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-900 px-6">
			<!-- Header content can go here -->
		</header>
		
		<!-- Page content -->
		<main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
			{@render children()}
		</main>
	</div>
</div>