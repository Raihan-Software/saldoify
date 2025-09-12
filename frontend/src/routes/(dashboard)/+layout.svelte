<script lang="ts">
	import '../../app.css';
	import AppSidebar from '$lib/components/app-sidebar.svelte';

	let { children, data } = $props();
</script>

<div class="flex h-screen bg-gray-50 dark:bg-gray-950">
	<AppSidebar {data} />
	
	<!-- Main content area -->
	<div class="flex-1 lg:ml-64">
		<!-- Page content with no header -->
		<main class="h-full overflow-y-auto">
			<div class="container mx-auto">
				{@render children()}
			</div>
		</main>
	</div>
</div>