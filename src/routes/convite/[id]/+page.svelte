<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const ROLE_LABELS: Record<string, string> = {
		owner: 'dono',
		admin: 'administrador',
		teacher: 'professor'
	};
</script>

<svelte:head><title>Convite</title></svelte:head>

<main class="flex min-h-svh items-center justify-center p-6">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title>Convite para a equipe</Card.Title>
			<Card.Description>Você entrou como {data.signedInAs}.</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			{#if data.invitation}
				<p>
					Você foi convidado para participar de <strong>{data.invitation.organizationName}</strong>
					como {ROLE_LABELS[data.invitation.role] ?? data.invitation.role}.
				</p>
				{#if form?.message}
					<Alert.Root variant="destructive">
						<Alert.Description>{form.message}</Alert.Description>
					</Alert.Root>
				{/if}
			{:else}
				<Alert.Root variant="destructive">
					<Alert.Title>Não foi possível abrir o convite</Alert.Title>
					<Alert.Description>{data.problem}</Alert.Description>
				</Alert.Root>
			{/if}
		</Card.Content>
		<Card.Footer class="mt-6 flex gap-2">
			{#if data.invitation}
				<form method="POST" action="?/accept" use:enhance>
					<Button type="submit">Aceitar convite</Button>
				</form>
			{/if}
			<Button href="/" variant="ghost">Voltar</Button>
		</Card.Footer>
	</Card.Root>
</main>
