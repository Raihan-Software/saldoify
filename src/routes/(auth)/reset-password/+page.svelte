<script lang="ts">
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Lock, Loader2, CheckCircle } from '@lucide/svelte';
	
	let password = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
	let isSuccess = $state(false);
	let errors = $state<{ password?: string; confirmPassword?: string; general?: string }>({});
	
	function validateForm() {
		const newErrors: typeof errors = {};
		
		if (!password) {
			newErrors.password = 'Password is required';
		} else if (password.length < 8) {
			newErrors.password = 'Password must be at least 8 characters';
		} else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
			newErrors.password = 'Password must contain uppercase, lowercase, and number';
		}
		
		if (!confirmPassword) {
			newErrors.confirmPassword = 'Please confirm your password';
		} else if (password !== confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match';
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
		{#if isSuccess}
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
				
				<Button href="/login" class="w-full">
					Continue to Sign In
				</Button>
			</div>
		{:else}
			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="space-y-2">
					<Label for="password">New Password</Label>
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
					{#if errors.password}
						<p class="text-sm text-red-500">{errors.password}</p>
					{/if}
				</div>
				
				<div class="space-y-2">
					<Label for="confirmPassword">Confirm New Password</Label>
					<div class="relative">
						<Lock class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							id="confirmPassword"
							type="password"
							placeholder="••••••••"
							bind:value={confirmPassword}
							class="pl-9"
							disabled={isLoading}
						/>
					</div>
					{#if errors.confirmPassword}
						<p class="text-sm text-red-500">{errors.confirmPassword}</p>
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
						Resetting password...
					{:else}
						Reset Password
					{/if}
				</Button>
			</form>
		{/if}
	</CardContent>
</Card>