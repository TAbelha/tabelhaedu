<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const ROLE_LABELS: Record<string, string> = {
		owner: 'Dono',
		admin: 'Administrador',
		teacher: 'Professor'
	};

	let role = $state('teacher');
	let pending = $state(false);
	let lastLink = $state<string | null>(null);

	function roleLabel(value: string): string {
		return value
			.split(',')
			.map((r) => ROLE_LABELS[r.trim()] ?? r)
			.join(', ');
	}

	async function copy(link: string) {
		await navigator.clipboard.writeText(link);
		toast.success('Link copiado.');
	}

	const feedback: SubmitFunction = ({ action }) => {
		const inviting = action.search === '?/invite';
		if (inviting) pending = true;
		return async ({ result, update }) => {
			if (inviting) pending = false;
			if (result.type === 'success') {
				toast.success(String(result.data?.message ?? 'Feito.'));
				if (typeof result.data?.link === 'string') lastLink = result.data.link;
			} else if (result.type === 'failure') {
				toast.error(String(result.data?.message ?? 'Não foi possível concluir a ação.'));
			}
			await update({ reset: result.type === 'success' });
		};
	};
</script>

<svelte:head><title>Equipe · {data.org.name}</title></svelte:head>

<div class="flex flex-col gap-1">
	<h1 class="text-2xl font-semibold">Equipe</h1>
	<p class="text-muted-foreground">Quem administra a instituição e cria conteúdo.</p>
</div>

<div class="grid gap-6 xl:grid-cols-3">
	<Card.Root class="xl:col-span-2">
		<Card.Header>
			<Card.Title>Membros</Card.Title>
			<Card.Description>Alunos não aparecem aqui: eles entram pelos cursos.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Nome</Table.Head>
						<Table.Head>Papel</Table.Head>
						<Table.Head class="w-0"><span class="sr-only">Ações</span></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.members as member (member.id)}
						<Table.Row>
							<Table.Cell>
								<div class="flex flex-col">
									<span class="font-medium">{member.name}</span>
									<span class="text-xs text-muted-foreground">{member.email}</span>
								</div>
							</Table.Cell>
							<Table.Cell><Badge variant="secondary">{roleLabel(member.role)}</Badge></Table.Cell>
							<Table.Cell>
								{#if member.userId !== data.me}
									<form method="POST" action="?/remove" use:enhance={feedback}>
										<input type="hidden" name="id" value={member.id} />
										<Button type="submit" variant="ghost" size="sm">Remover</Button>
									</form>
								{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Convidar</Card.Title>
			<Card.Description>
				A pessoa precisa entrar com o mesmo e-mail para aceitar o convite.
			</Card.Description>
		</Card.Header>
		<form method="POST" action="?/invite" use:enhance={feedback}>
			<Card.Content>
				<Field.FieldGroup>
					<Field.Field>
						<Field.FieldLabel for="invite-email">E-mail</Field.FieldLabel>
						<Input id="invite-email" name="email" type="email" required />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Papel</Field.FieldLabel>
						<Select.Root type="single" bind:value={role}>
							<Select.Trigger class="w-full">{ROLE_LABELS[role]}</Select.Trigger>
							<Select.Content>
								<Select.Group>
									<Select.Item value="teacher" label="Professor">Professor</Select.Item>
									<Select.Item value="admin" label="Administrador">Administrador</Select.Item>
								</Select.Group>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="role" value={role} />
					</Field.Field>
				</Field.FieldGroup>
			</Card.Content>
			<Card.Footer class="mt-6">
				<Button type="submit" disabled={pending}>
					{#if pending}<Spinner data-icon="inline-start" />{/if}
					Criar convite
				</Button>
			</Card.Footer>
		</form>
		{#if lastLink}
			<Card.Content class="mt-4">
				<div class="flex gap-2">
					<Input readonly value={lastLink} aria-label="Link do convite" />
					<Button
						variant="outline"
						size="icon"
						aria-label="Copiar link"
						onclick={() => copy(lastLink!)}
					>
						<CopyIcon />
					</Button>
				</div>
			</Card.Content>
		{/if}
	</Card.Root>

	{#if data.invitations.length > 0}
		<Card.Root class="xl:col-span-3">
			<Card.Header>
				<Card.Title>Convites pendentes</Card.Title>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>E-mail</Table.Head>
							<Table.Head>Papel</Table.Head>
							<Table.Head>Expira em</Table.Head>
							<Table.Head class="w-0"><span class="sr-only">Ações</span></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.invitations as invitation (invitation.id)}
							<Table.Row>
								<Table.Cell>{invitation.email}</Table.Cell>
								<Table.Cell>{roleLabel(invitation.role ?? '')}</Table.Cell>
								<Table.Cell>{invitation.expiresAt.toLocaleDateString('pt-BR')}</Table.Cell>
								<Table.Cell>
									<div class="flex gap-1">
										<Button variant="ghost" size="sm" onclick={() => copy(invitation.link)}>
											Copiar link
										</Button>
										<form method="POST" action="?/cancel" use:enhance={feedback}>
											<input type="hidden" name="id" value={invitation.id} />
											<Button type="submit" variant="ghost" size="sm">Cancelar</Button>
										</form>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
