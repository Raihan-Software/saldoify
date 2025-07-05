<script lang="ts">
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Mail, Lock, User, Loader2 } from '@lucide/svelte';
	
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let agreeToTerms = $state(false);
	let isLoading = $state(false);
	let errors = $state<{ name?: string; email?: string; password?: string; confirmPassword?: string; terms?: string; general?: string }>({});
	
	function validateForm() {
		const newErrors: typeof errors = {};
		
		if (!name) {
			newErrors.name = 'Name is required';
		} else if (name.length < 2) {
			newErrors.name = 'Name must be at least 2 characters';
		}
		
		if (!email) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = 'Please enter a valid email';
		}
		
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
		
		if (!agreeToTerms) {
			newErrors.terms = 'You must agree to the terms and conditions';
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
			// For demo, just redirect to login
			window.location.href = '/login';
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
		<CardTitle class="text-2xl text-center">Create an account</CardTitle>
		<CardDescription class="text-center">
			Enter your information to create your Saldoify account
		</CardDescription>
	</CardHeader>
	<CardContent>
		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Full Name</Label>
				<div class="relative">
					<User class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						id="name"
						type="text"
						placeholder="John Doe"
						bind:value={name}
						class="pl-9"
						disabled={isLoading}
					/>
				</div>
				{#if errors.name}
					<p class="text-sm text-red-500">{errors.name}</p>
				{/if}
			</div>
			
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
				<Label for="password">Password</Label>
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
				<Label for="confirmPassword">Confirm Password</Label>
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
			
			<div class="space-y-2">
				<div class="flex items-start space-x-2">
					<Checkbox id="terms" bind:checked={agreeToTerms} disabled={isLoading} class="mt-1" />
					<Label for="terms" class="text-sm font-normal cursor-pointer leading-relaxed">
						I agree to the{' '}
						<a href="/terms" class="font-medium text-primary hover:underline">Terms of Service</a>
						{' '}and{' '}
						<a href="/privacy" class="font-medium text-primary hover:underline">Privacy Policy</a>
					</Label>
				</div>
				{#if errors.terms}
					<p class="text-sm text-red-500">{errors.terms}</p>
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
					Creating account...
				{:else}
					Create Account
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
			Already have an account?{' '}
			<a href="/login" class="font-medium text-primary hover:underline">
				Sign in
			</a>
		</p>
	</CardFooter>
</Card>