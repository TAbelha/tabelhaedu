<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import OrgLogo from '#lib/components/org-logo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<main class="flex min-h-svh items-center justify-center p-6">
	{#if data.org}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media>
					<OrgLogo org={data.org} class="size-16" />
				</Empty.Media>
				<Empty.Title>{data.org.name}</Empty.Title>
				<Empty.Description>
					{#if data.user}
						Olá, {data.user.name}.
					{:else}
						Entre para acessar seus cursos.
					{/if}
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<div class="flex gap-2">
					{#if data.memberRole}
						<Button href="/admin">Administração</Button>
					{/if}
					{#if !data.user}
						<Button href="/login">Entrar</Button>
						<Button href="/cadastro" variant="outline">Criar conta</Button>
					{/if}
				</div>
			</Empty.Content>
		</Empty.Root>
	{:else}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media>
					<OrgLogo org={null} class="size-16" />
				</Empty.Media>
				<Empty.Title>tabelhaedu</Empty.Title>
				<Empty.Description>Nenhuma instituição está configurada neste endereço.</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				{#if data.isPlatformAdmin}
					<Button href="/plataforma">Gerenciar instituições</Button>
				{:else if !data.user}
					<Button href="/login?next=%2Fplataforma">Entrar</Button>
				{/if}
			</Empty.Content>
		</Empty.Root>
	{/if}
</main>
