<script lang="ts">
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Mail, Lock, Loader2 } from '@lucide/svelte';
	
	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let isLoading = $state(false);
	let errors = $state<{ email?: string; password?: string; general?: string }>({});
	
	function validateForm() {
		const newErrors: typeof errors = {};
		
		if (!email) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = 'Please enter a valid email';
		}
		
		if (!password) {
			newErrors.password = 'Password is required';
		} else if (password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters';
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
			// For demo, just redirect to dashboard
			window.location.href = '/';
		}, 1500);
	}
</script>

<Card class="shadow-xl border-0">
	<CardHeader class="space-y-1">
		<CardTitle class="text-2xl text-center">Welcome back</CardTitle>
		<CardDescription class="text-center">
			Enter your email and password to sign in to your account
		</CardDescription>
	</CardHeader>
	<CardContent>
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
			
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label for="password">Password</Label>
					<a href="/forgot-password" class="text-sm text-primary hover:underline">
						Forgot password?
					</a>
				</div>
				<div class="relative">
					<Lock class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						id="password"
						type="password"
						placeholder="••••••••"
						bind:value={password}
						class="pl-9"
						disabled={isLoading}
					/>
				</div>
				{#if errors.password}
					<p class="text-sm text-red-500">{errors.password}</p>
				{/if}
			</div>
			
			<div class="flex items-center space-x-2">
				<Checkbox id="remember" bind:checked={rememberMe} disabled={isLoading} />
				<Label for="remember" class="text-sm font-normal cursor-pointer">
					Remember me for 30 days
				</Label>
			</div>
			
			{#if errors.general}
				<div class="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
					{errors.general}
				</div>
			{/if}
			
			<Button type="submit" class="w-full" disabled={isLoading}>
				{#if isLoading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Signing in...
				{:else}
					Sign In
				{/if}
			</Button>
		</form>
		
		<div class="relative my-6">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t"></div>
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="bg-white dark:bg-gray-950 px-2 text-muted-foreground">Or continue with</span>
			</div>
		</div>
		
		<Button variant="outline" class="w-full" disabled={isLoading}>
			<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
				/>
				<path
					fill="currentColor"
					d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				/>
				<path
					fill="currentColor"
					d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				/>
				<path
					fill="currentColor"
					d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				/>
			</svg>
			Continue with Google
		</Button>
	</CardContent>
	<CardFooter>
		<p class="text-center text-sm text-muted-foreground w-full">
			Don't have an account?{' '}
			<a href="/register" class="font-medium text-primary hover:underline">
				Sign up
			</a>
		</p>
	</CardFooter>
</Card>