<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Mail, Lock, Loader2 } from '@lucide/svelte';
	import type { ActionData } from './$types';
	
	let { form }: { form: ActionData } = $props();
	
	let isLoading = $state(false);
	let rememberMe = $state(false);
</script>

<Card class="shadow-xl border-0">
	<CardHeader class="space-y-1">
		<CardTitle class="text-2xl text-center">Welcome back</CardTitle>
		<CardDescription class="text-center">
			Enter your email and password to sign in to your account
		</CardDescription>
	</CardHeader>
	<CardContent>
		<form 
			method="POST" 
			class="space-y-4"
			use:enhance={() => {
				isLoading = true;
				return async ({ update }) => {
					await update();
					isLoading = false;
				};
			}}
		>
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<div class="relative">
					<Mail class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="john@example.com"
						value={form?.email || ''}
						class="pl-9"
						disabled={isLoading}
						required
					/>
				</div>
				{#if form?.errors && 'email' in form.errors && form.errors.email}
					<p class="text-sm text-red-500">{form.errors.email}</p>
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
						name="password"
						type="password"
						placeholder="••••••••"
						class="pl-9"
						disabled={isLoading}
						required
					/>
				</div>
				{#if form?.errors && 'password' in form.errors && form.errors.password}
					<p class="text-sm text-red-500">{form.errors.password}</p>
				{/if}
			</div>
			
			<div class="flex items-center space-x-2">
				<Checkbox id="remember" name="remember" bind:checked={rememberMe} disabled={isLoading} />
				<Label for="remember" class="text-sm font-normal cursor-pointer">
					Remember me
				</Label>
			</div>
			
			{#if form?.errors && 'general' in form.errors && form.errors.general}
				<div class="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
					{form.errors.general}
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