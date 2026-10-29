<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let name = $state('');
	let slug = $state('');
	let slugTouched = $state(false);
	let pending = $state(false);

	function slugify(value: string): string {
		return value
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 48);
	}

	$effect(() => {
		if (!slugTouched) slug = slugify(name);
	});
</script>

<svelte:head><title>Plataforma · tabelhaedu</title></svelte:head>

<main class="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
	<div class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold">Instituições</h1>
		<p class="text-muted-foreground">Cada instituição tem sua própria marca, equipe e cursos.</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<Card.Root>
			<Card.Header>
				<Card.Title>Nova instituição</Card.Title>
				<Card.Description>Você vira dono da instituição criada.</Card.Description>
			</Card.Header>
			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					pending = true;
					return async ({ result, update }) => {
						pending = false;
						if (result.type === 'success') {
							toast.success(String(result.data?.message));
							name = '';
							slugTouched = false;
						} else if (result.type === 'failure') {
							toast.error(String(result.data?.message));
						}
						await update({ reset: result.type === 'success' });
					};
				}}
			>
				<Card.Content>
					<Field.FieldGroup>
						<Field.Field>
							<Field.FieldLabel for="org-name">Nome</Field.FieldLabel>
							<Input id="org-name" name="name" required maxlength={80} bind:value={name} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="org-slug">Identificador</Field.FieldLabel>
							<Input
								id="org-slug"
								name="slug"
								required
								bind:value={slug}
								oninput={() => (slugTouched = true)}
							/>
							<Field.FieldDescription>Letras minúsculas, números e hífens.</Field.FieldDescription>
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="org-host">Domínio (opcional)</Field.FieldLabel>
							<Input id="org-host" name="hostname" placeholder="cursinho.exemplo.com.br" />
						</Field.Field>
					</Field.FieldGroup>
				</Card.Content>
				<Card.Footer class="mt-6">
					<Button type="submit" disabled={pending}>
						{#if pending}<Spinner data-icon="inline-start" />{/if}
						Criar instituição
					</Button>
				</Card.Footer>
			</form>
		</Card.Root>

		<Card.Root class="lg:col-span-2">
			<Card.Header>
				<Card.Title>Cadastradas</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if data.organizations.length === 0}
					<Empty.Root>
						<Empty.Header>
							<Empty.Title>Nenhuma instituição ainda</Empty.Title>
							<Empty.Description>Crie a primeira ao lado.</Empty.Description>
						</Empty.Header>
					</Empty.Root>
				{:else}
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Nome</Table.Head>
								<Table.Head>Identificador</Table.Head>
								<Table.Head>Domínio principal</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.organizations as org (org.id)}
								<Table.Row>
									<Table.Cell class="font-medium">{org.name}</Table.Cell>
									<Table.Cell class="font-mono">{org.slug}</Table.Cell>
									<Table.Cell class="font-mono">{org.primaryDomain ?? '—'}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
