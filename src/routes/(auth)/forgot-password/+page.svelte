<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Mail, ArrowLeft, Loader2, CheckCircle } from '@lucide/svelte';
	import type { ActionData } from './$types';
	
	let { form }: { form: ActionData } = $props();
	
	let isLoading = $state(false);
	let submittedEmail = $state('');
	
	$effect(() => {
		if (form?.success) {
			submittedEmail = form.email;
		}
	});
</script>

<Card class="shadow-xl border-0">
	<CardHeader class="space-y-1">
		<CardTitle class="text-2xl text-center">Forgot your password?</CardTitle>
		<CardDescription class="text-center">
			No worries, we'll send you reset instructions
		</CardDescription>
	</CardHeader>
	<CardContent>
		{#if form?.success || submittedEmail}
			<div class="space-y-4">
				<div class="flex justify-center">
					<div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
						<CheckCircle class="h-8 w-8 text-green-600 dark:text-green-400" />
					</div>
				</div>
				
				<div class="text-center space-y-2">
					<h3 class="font-semibold text-lg">Check your email</h3>
					<p class="text-sm text-muted-foreground">
						We've sent password reset instructions to {submittedEmail || form?.email}
					</p>
				</div>
				
				<a href="/login" class="w-full">
					<Button class="w-full">Back to Sign In</Button>
				</a>
				
				<p class="text-center text-sm text-muted-foreground">
					Didn't receive the email? Check your spam folder or{' '}
					<button 
						onclick={() => { submittedEmail = ''; }} 
						class="font-medium text-primary hover:underline"
					>
						try another email
					</button>
				</p>
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
					{#if form?.errors?.email}
						<p class="text-sm text-red-500">{form.errors.email}</p>
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