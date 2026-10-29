<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Administração · {data.org.name}</title></svelte:head>

<div class="flex flex-col gap-1">
	<h1 class="text-2xl font-semibold">Olá, {data.user?.name}</h1>
	<p class="text-muted-foreground">Administração de {data.org.name}.</p>
</div>

<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
	{#if data.canEditOrg}
		<Card.Root>
			<Card.Header>
				<Card.Title>Organização</Card.Title>
				<Card.Description>Nome, logo, cores, fuso horário e domínios.</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button href="/admin/organizacao" variant="outline">Configurar</Button>
			</Card.Footer>
		</Card.Root>
	{/if}
	{#if data.canManageTeam}
		<Card.Root>
			<Card.Header>
				<Card.Title>Equipe</Card.Title>
				<Card.Description>Convide professores e administradores.</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button href="/admin/equipe" variant="outline">Gerenciar</Button>
			</Card.Footer>
		</Card.Root>
	{/if}
</div>
