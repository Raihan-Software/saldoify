<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Mail, Lock, User, Loader2 } from '@lucide/svelte';
	import type { ActionData } from './$types';
	
	let { form }: { form: ActionData } = $props();
	
	let password = $state('');
	let isLoading = $state(false);
	
	// Password strength indicator
	let passwordStrength = $derived(() => {
		if (!password) return { score: 0, text: '', color: '' };
		
		let score = 0;
		if (password.length >= 8) score++;
		if (password.length >= 12) score++;
		if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
		if (/\d/.test(password)) score++;
		if (/[^a-zA-Z0-9]/.test(password)) score++;
		
		const strength = [
			{ score: 0, text: '', color: '' },
			{ score: 1, text: 'Weak', color: 'bg-red-500' },
			{ score: 2, text: 'Fair', color: 'bg-orange-500' },
			{ score: 3, text: 'Good', color: 'bg-yellow-500' },
			{ score: 4, text: 'Strong', color: 'bg-green-500' },
			{ score: 5, text: 'Very Strong', color: 'bg-green-600' }
		];
		
		return strength[Math.min(score, 5)];
	});
</script>

<Card class="shadow-xl border-0">
	<CardHeader class="space-y-1">
		<CardTitle class="text-2xl text-center">Create an account</CardTitle>
		<CardDescription class="text-center">
			Enter your information to create your Saldoify account
		</CardDescription>
	</CardHeader>
	<CardContent>
		<form 
			method="POST" 
			use:enhance={() => {
				isLoading = true;
				return async ({ update }) => {
					await update();
					isLoading = false;
				};
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="name">Full Name</Label>
				<div class="relative">
					<User class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						id="name"
						name="name"
						type="text"
						placeholder="John Doe"
						value={form?.data?.name || ''}
						class="pl-9"
						disabled={isLoading}
						required
					/>
				</div>
				{#if form?.errors?.name}
					<p class="text-sm text-red-500">{form.errors.name}</p>
				{/if}
			</div>
			
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<div class="relative">
					<Mail class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="john@example.com"
						value={form?.data?.email || ''}
						class="pl-9"
						disabled={isLoading}
						required
					/>
				</div>
				{#if form?.errors?.email}
					<p class="text-sm text-red-500">{form.errors.email}</p>
				{/if}
			</div>
			
			<div class="space-y-2">
				<Label for="password">Password</Label>
				<div class="relative">
					<Lock class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						id="password"
						name="password"
						type="password"
						placeholder="••••••••"
						bind:value={password}
						class="pl-9"
						disabled={isLoading}
						required
					/>
				</div>
				{#if password && passwordStrength().score > 0}
					<div class="space-y-1">
						<div class="flex gap-1">
							{#each Array(5) as _, i}
								<div class="h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
									{#if i < passwordStrength().score}
										<div class="h-full {passwordStrength().color}"></div>
									{/if}
								</div>
							{/each}
						</div>
						<p class="text-xs text-muted-foreground">
							Password strength: <span class="font-medium">{passwordStrength().text}</span>
						</p>
					</div>
				{/if}
				{#if form?.errors?.password}
					<p class="text-sm text-red-500">{form.errors.password}</p>
				{/if}
			</div>
			
			<div class="space-y-2">
				<Label for="confirmPassword">Confirm Password</Label>
				<div class="relative">
					<Lock class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						placeholder="••••••••"
						class="pl-9"
						disabled={isLoading}
						required
					/>
				</div>
				{#if form?.errors?.confirmPassword}
					<p class="text-sm text-red-500">{form.errors.confirmPassword}</p>
				{/if}
			</div>
			
			<div class="space-y-2">
				<div class="flex items-start space-x-2">
					<Checkbox id="terms" name="terms" disabled={isLoading} class="mt-1" />
					<Label for="terms" class="text-sm font-normal cursor-pointer leading-relaxed">
						I agree to the{' '}
						<a href="/terms" class="font-medium text-primary hover:underline">Terms of Service</a>
						{' '}and{' '}
						<a href="/privacy" class="font-medium text-primary hover:underline">Privacy Policy</a>
					</Label>
				</div>
				{#if form?.errors?.terms}
					<p class="text-sm text-red-500">{form.errors.terms}</p>
				{/if}
			</div>
			
			{#if form?.errors?.general}
				<div class="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
					{form.errors.general}
				</div>
			{/if}
			
			<Button type="submit" class="w-full" disabled={isLoading}>
				{#if isLoading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Creating account...
				{:else}
					Create Account
				{/if}
			</Button>
		</form>

	</CardContent>
	<CardFooter>
		<p class="text-center text-sm text-muted-foreground w-full">
			Already have an account?{' '}
			<a href="/login" class="font-medium text-primary hover:underline">
				Sign in
			</a>
		</p>
	</CardFooter>
</Card>