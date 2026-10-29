<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '#lib/auth-client.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';

	const MIN_PASSWORD = 8;

	let { next, orgName }: { next: string; orgName: string } = $props();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (password.length < MIN_PASSWORD) {
			error = `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`;
			return;
		}
		loading = true;
		error = '';
		const { error: failure } = await authClient.signUp.email({ name, email, password });
		loading = false;
		if (failure) {
			error =
				failure.code === 'USER_ALREADY_EXISTS' ||
				failure.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL'
					? 'Já existe uma conta com este e-mail.'
					: 'Não foi possível criar a conta.';
			return;
		}
		// `next` is a same-site path already validated by safeNext on the server.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(next, { invalidateAll: true });
	}
</script>

<Card.Root class="w-full max-w-sm">
	<Card.Header>
		<Card.Title>Criar conta</Card.Title>
		<Card.Description>Cadastre-se em {orgName}.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form onsubmit={submit}>
			<Field.FieldGroup>
				<Field.Field>
					<Field.FieldLabel for="name">Nome</Field.FieldLabel>
					<Input id="name" autocomplete="name" required bind:value={name} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="email">E-mail</Field.FieldLabel>
					<Input id="email" type="email" autocomplete="email" required bind:value={email} />
				</Field.Field>
				<Field.Field data-invalid={error ? true : undefined}>
					<Field.FieldLabel for="password">Senha</Field.FieldLabel>
					<Input
						id="password"
						type="password"
						autocomplete="new-password"
						required
						bind:value={password}
						aria-invalid={error ? true : undefined}
					/>
					{#if error}
						<Field.FieldError>{error}</Field.FieldError>
					{:else}
						<Field.FieldDescription>Pelo menos {MIN_PASSWORD} caracteres.</Field.FieldDescription>
					{/if}
				</Field.Field>
				<Field.Field>
					<Button type="submit" disabled={loading}>
						{#if loading}<Spinner data-icon="inline-start" />{/if}
						Criar conta
					</Button>
					<Field.FieldDescription class="text-center">
						Já tem conta?
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() plus a query string -->
						<a href={`${resolve('/login')}?next=${encodeURIComponent(next)}`}>Entrar</a>
					</Field.FieldDescription>
				</Field.Field>
			</Field.FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
