<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '#lib/auth-client.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';

	let { next, orgName }: { next: string; orgName: string } = $props();

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		error = '';
		const { error: failure } = await authClient.signIn.email({ email, password });
		loading = false;
		if (failure) {
			error = 'E-mail ou senha inválidos.';
			return;
		}
		// `next` is a same-site path already validated by safeNext on the server.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(next, { invalidateAll: true });
	}
</script>

<Card.Root class="w-full max-w-sm">
	<Card.Header>
		<Card.Title>Entrar</Card.Title>
		<Card.Description>Acesse sua conta em {orgName}.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form onsubmit={submit}>
			<Field.FieldGroup>
				<Field.Field data-invalid={error ? true : undefined}>
					<Field.FieldLabel for="email">E-mail</Field.FieldLabel>
					<Input id="email" type="email" autocomplete="email" required bind:value={email} />
				</Field.Field>
				<Field.Field data-invalid={error ? true : undefined}>
					<Field.FieldLabel for="password">Senha</Field.FieldLabel>
					<Input
						id="password"
						type="password"
						autocomplete="current-password"
						required
						bind:value={password}
						aria-invalid={error ? true : undefined}
					/>
					{#if error}
						<Field.FieldError>{error}</Field.FieldError>
					{/if}
				</Field.Field>
				<Field.Field>
					<Button type="submit" disabled={loading}>
						{#if loading}<Spinner data-icon="inline-start" />{/if}
						Entrar
					</Button>
					<Field.FieldDescription class="text-center">
						Ainda não tem conta?
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() plus a query string -->
						<a href={`${resolve('/cadastro')}?next=${encodeURIComponent(next)}`}>Cadastre-se</a>
					</Field.FieldDescription>
				</Field.Field>
			</Field.FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
