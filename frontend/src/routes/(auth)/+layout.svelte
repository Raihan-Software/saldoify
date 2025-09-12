<script lang="ts">
	import '../../app.css';
	
	let { children } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<!-- Logo/Brand -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
				Saldoify
			</h1>
			<p class="text-muted-foreground mt-2">Personal Finance Manager</p>
		</div>
		
		<!-- Auth Content -->
		{@render children()}
		
		<!-- Footer -->
		<div class="text-center mt-8 text-sm text-muted-foreground">
			<p>&copy; 2024 Saldoify. All rights reserved.</p>
		</div>
	</div>
</div>