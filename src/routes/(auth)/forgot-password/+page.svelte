<script lang="ts">
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Mail, ArrowLeft, Loader2, CheckCircle } from '@lucide/svelte';
	
	let email = $state('');
	let isLoading = $state(false);
	let isSuccess = $state(false);
	let errors = $state<{ email?: string; general?: string }>({});
	
	function validateForm() {
		const newErrors: typeof errors = {};
		
		if (!email) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = 'Please enter a valid email';
		}
		
		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}
	
	async function handleSubmit(e: Event) {
		e.preventDefault();
		
		if (!validateForm()) return;
		
		isLoading = true;
		
		// Simulate API call
		setTimeout(() => {
			isLoading = false;
			isSuccess = true;
		}, 1500);
	}
</script>

<Card class="shadow-xl border-0">
	<CardHeader class="space-y-1">
		<CardTitle class="text-2xl text-center">Forgot your password?</CardTitle>
		<CardDescription class="text-center">
			No worries, we'll send you reset instructions
		</CardDescription>
	</CardHeader>
	<CardContent>
		{#if isSuccess}
			<div class="space-y-4">
				<div class="flex justify-center">
					<div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
						<CheckCircle class="h-8 w-8 text-green-600 dark:text-green-400" />
					</div>
				</div>
				
				<div class="text-center space-y-2">
					<h3 class="font-semibold text-lg">Check your email</h3>
					<p class="text-sm text-muted-foreground">
						We've sent password reset instructions to {email}
					</p>
				</div>
				
				<Button href="/login" class="w-full">
					Back to Sign In
				</Button>
				
				<p class="text-center text-sm text-muted-foreground">
					Didn't receive the email? Check your spam folder or{' '}
					<button 
						onclick={() => { isSuccess = false; email = ''; }} 
						class="font-medium text-primary hover:underline"
					>
						try another email
					</button>
				</p>
			</div>
		{:else}
			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<div class="relative">
						<Mail class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							id="email"
							type="email"
							placeholder="john@example.com"
							bind:value={email}
							class="pl-9"
							disabled={isLoading}
						/>
					</div>
					{#if errors.email}
						<p class="text-sm text-red-500">{errors.email}</p>
					{/if}
				</div>
				
				{#if errors.general}
					<div class="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
						{errors.general}
					</div>
				{/if}
				
				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Sending reset link...
					{:else}
						Send Reset Link
					{/if}
				</Button>
			</form>
		{/if}
	</CardContent>
	<CardFooter>
		<a href="/login" class="flex items-center justify-center w-full text-sm text-muted-foreground hover:text-primary">
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Sign In
		</a>
	</CardFooter>
</Card>