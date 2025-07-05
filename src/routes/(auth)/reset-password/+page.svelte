<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Lock, Loader2, CheckCircle } from '@lucide/svelte';
	import { Progress } from '$lib/components/ui/progress';
	import type { ActionData } from './$types';
	
	let { form }: { form: ActionData } = $props();
	
	let password = $state('');
	let confirmPassword = $state('');
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
		<CardTitle class="text-2xl text-center">Reset your password</CardTitle>
		<CardDescription class="text-center">
			Enter your new password below
		</CardDescription>
	</CardHeader>
	<CardContent>
		{#if form?.success}
			<div class="space-y-4">
				<div class="flex justify-center">
					<div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
						<CheckCircle class="h-8 w-8 text-green-600 dark:text-green-400" />
					</div>
				</div>
				
				<div class="text-center space-y-2">
					<h3 class="font-semibold text-lg">Password reset successful</h3>
					<p class="text-sm text-muted-foreground">
						Your password has been reset successfully. You can now sign in with your new password.
					</p>
				</div>
				
				<a href="/login" class="w-full">
					<Button class="w-full">Continue to Sign In</Button>
				</a>
			</div>
		{:else if form?.error === 'invalid_token'}
			<div class="space-y-4">
				<div class="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
					This password reset link is invalid or has expired. Please request a new one.
				</div>
				
				<a href="/forgot-password" class="w-full">
					<Button class="w-full">Request New Link</Button>
				</a>
			</div>
		{:else}
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
					<Label for="password">New Password</Label>
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
							minlength="8"
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
					<Label for="confirmPassword">Confirm New Password</Label>
					<div class="relative">
						<Lock class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							placeholder="••••••••"
							bind:value={confirmPassword}
							class="pl-9"
							disabled={isLoading}
							required
						/>
					</div>
					{#if form?.errors?.confirmPassword}
						<p class="text-sm text-red-500">{form.errors.confirmPassword}</p>
					{/if}
					{#if confirmPassword && password !== confirmPassword}
						<p class="text-sm text-red-500">Passwords do not match</p>
					{/if}
				</div>
				
				{#if form?.errors?.general}
					<div class="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
						{form.errors.general}
					</div>
				{/if}
				
				<Button 
					type="submit" 
					class="w-full" 
					disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
				>
					{#if isLoading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Resetting password...
					{:else}
						Reset Password
					{/if}
				</Button>
			</form>
		{/if}
	</CardContent>
	{#if !form?.success}
		<CardFooter>
			<a href="/login" class="flex items-center justify-center w-full text-sm text-muted-foreground hover:text-primary">
				Back to Sign In
			</a>
		</CardFooter>
	{/if}
</Card>