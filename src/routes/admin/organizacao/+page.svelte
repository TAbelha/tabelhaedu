<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import ImageUpIcon from '@lucide/svelte/icons/image-up';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import OrgLogo from '#lib/components/org-logo.svelte';
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

	const RADIUS_OPTIONS = [
		{ value: 'default', label: 'Padrão do tema' },
		{ value: '0', label: 'Reto' },
		{ value: '0.25rem', label: 'Pequeno' },
		{ value: '0.5rem', label: 'Médio' },
		{ value: '0.75rem', label: 'Grande' },
		{ value: '1rem', label: 'Extra grande' }
	];
	const TIMEZONES = [
		{ value: 'America/Sao_Paulo', label: 'Brasília (São Paulo, Rio, BH, Sul)' },
		{ value: 'America/Bahia', label: 'Bahia' },
		{ value: 'America/Fortaleza', label: 'Fortaleza' },
		{ value: 'America/Recife', label: 'Recife' },
		{ value: 'America/Belem', label: 'Belém' },
		{ value: 'America/Manaus', label: 'Manaus' },
		{ value: 'America/Cuiaba', label: 'Cuiabá' },
		{ value: 'America/Porto_Velho', label: 'Porto Velho' },
		{ value: 'America/Rio_Branco', label: 'Rio Branco' },
		{ value: 'America/Noronha', label: 'Fernando de Noronha' }
	];

	// Form fields follow the loaded data and can be edited locally until the next load.
	let name = $derived(data.profile.name);
	let logo = $derived(data.profile.logo ?? '');
	let primaryColor = $derived(data.settings.primaryColor ?? '');
	let accentColor = $derived(data.settings.accentColor ?? '');
	let radius = $derived(data.settings.radius ?? 'default');
	let timezone = $derived(data.settings.timezone);

	let uploading = $state(false);
	let pending = $state<string | null>(null);

	const radiusLabel = $derived(RADIUS_OPTIONS.find((o) => o.value === radius)?.label ?? '');
	const timezoneLabel = $derived(TIMEZONES.find((t) => t.value === timezone)?.label ?? timezone);

	function submitting(key: string): SubmitFunction {
		return () => {
			pending = key;
			return async ({ result, update }) => {
				pending = null;
				if (result.type === 'success') {
					toast.success(String(result.data?.message ?? 'Salvo.'));
					// The theme is rendered into <head> on the server, so a reload applies it.
					if (result.data?.reload) {
						location.reload();
						return;
					}
				} else if (result.type === 'failure') {
					toast.error(String(result.data?.message ?? 'Não foi possível salvar.'));
				}
				await update({ reset: false });
			};
		};
	}

	async function upload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploading = true;
		const body = new FormData();
		body.set('file', file);
		const response = await fetch('/api/media', { method: 'POST', body });
		uploading = false;
		input.value = '';
		const payload = (await response.json().catch(() => null)) as {
			url?: string;
			message?: string;
		} | null;
		if (!response.ok || !payload?.url) {
			toast.error(payload?.message ?? 'Não foi possível enviar a imagem.');
			return;
		}
		logo = payload.url;
	}

	function colorOrFallback(value: string, fallback: string): string {
		return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
	}
</script>

<svelte:head><title>Organização · {data.org.name}</title></svelte:head>

<div class="flex flex-col gap-1">
	<h1 class="text-2xl font-semibold">Organização</h1>
	<p class="text-muted-foreground">Como a sua instituição aparece para alunos e equipe.</p>
</div>

<div class="grid gap-6 xl:grid-cols-2">
	<Card.Root>
		<Card.Header>
			<Card.Title>Identidade</Card.Title>
			<Card.Description>Nome e logo exibidos no topo e no título das páginas.</Card.Description>
		</Card.Header>
		<form method="POST" action="?/profile" use:enhance={submitting('profile')}>
			<Card.Content>
				<Field.FieldGroup>
					<Field.Field>
						<Field.FieldLabel for="name">Nome</Field.FieldLabel>
						<Input id="name" name="name" required maxlength={80} bind:value={name} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="logo-file">Logo</Field.FieldLabel>
						<div class="flex items-center gap-4">
							<OrgLogo org={{ name, logo: logo || null }} class="size-14" />
							<div class="flex flex-wrap gap-2">
								<Button
									variant="outline"
									onclick={() => document.getElementById('logo-file')?.click()}
									disabled={uploading}
								>
									{#if uploading}<Spinner data-icon="inline-start" />{:else}<ImageUpIcon
											data-icon="inline-start"
										/>{/if}
									Enviar imagem
								</Button>
								{#if logo}
									<Button variant="ghost" onclick={() => (logo = '')}>Remover</Button>
								{/if}
							</div>
						</div>
						<input
							id="logo-file"
							type="file"
							accept="image/png,image/jpeg,image/webp,image/gif"
							class="sr-only"
							onchange={upload}
						/>
						<input type="hidden" name="logo" value={logo} />
						<Field.FieldDescription>PNG, JPEG, WebP ou GIF, até 5 MB.</Field.FieldDescription>
					</Field.Field>
				</Field.FieldGroup>
			</Card.Content>
			<Card.Footer class="mt-6">
				<Button type="submit" disabled={pending === 'profile' || uploading}>
					{#if pending === 'profile'}<Spinner data-icon="inline-start" />{/if}
					Salvar identidade
				</Button>
			</Card.Footer>
		</form>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Aparência e região</Card.Title>
			<Card.Description>Deixe em branco para usar as cores padrão.</Card.Description>
		</Card.Header>
		<form method="POST" action="?/theme" use:enhance={submitting('theme')}>
			<Card.Content>
				<Field.FieldGroup>
					<div class="grid gap-4 sm:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="primaryColor">Cor principal</Field.FieldLabel>
							<div class="flex gap-2">
								<input
									type="color"
									aria-label="Escolher cor principal"
									class="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent"
									value={colorOrFallback(primaryColor, '#000000')}
									oninput={(e) => (primaryColor = e.currentTarget.value)}
								/>
								<Input
									id="primaryColor"
									name="primaryColor"
									placeholder="#1d4ed8"
									bind:value={primaryColor}
								/>
							</div>
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="accentColor">Cor de destaque</Field.FieldLabel>
							<div class="flex gap-2">
								<input
									type="color"
									aria-label="Escolher cor de destaque"
									class="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent"
									value={colorOrFallback(accentColor, '#000000')}
									oninput={(e) => (accentColor = e.currentTarget.value)}
								/>
								<Input
									id="accentColor"
									name="accentColor"
									placeholder="#f59e0b"
									bind:value={accentColor}
								/>
							</div>
						</Field.Field>
					</div>
					<Field.Field>
						<Field.FieldLabel>Cantos arredondados</Field.FieldLabel>
						<Select.Root type="single" bind:value={radius}>
							<Select.Trigger class="w-full">{radiusLabel}</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each RADIUS_OPTIONS as option (option.value)}
										<Select.Item value={option.value} label={option.label}>
											{option.label}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="radius" value={radius === 'default' ? '' : radius} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Fuso horário</Field.FieldLabel>
						<Select.Root type="single" bind:value={timezone}>
							<Select.Trigger class="w-full">{timezoneLabel}</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each TIMEZONES as tz (tz.value)}
										<Select.Item value={tz.value} label={tz.label}>{tz.label}</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="timezone" value={timezone} />
						<Field.FieldDescription
							>Usado nas datas de provas e do cronograma.</Field.FieldDescription
						>
					</Field.Field>
				</Field.FieldGroup>
			</Card.Content>
			<Card.Footer class="mt-6">
				<Button type="submit" disabled={pending === 'theme'}>
					{#if pending === 'theme'}<Spinner data-icon="inline-start" />{/if}
					Salvar aparência
				</Button>
			</Card.Footer>
		</form>
	</Card.Root>

	<Card.Root class="xl:col-span-2">
		<Card.Header>
			<Card.Title>Domínios</Card.Title>
			<Card.Description>
				Endereços que abrem a plataforma com a cara da sua instituição. O domínio precisa apontar
				para a plataforma antes de funcionar.
			</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			{#if data.domains.length > 0}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Domínio</Table.Head>
							<Table.Head class="w-0"><span class="sr-only">Ações</span></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.domains as domain (domain.hostname)}
							<Table.Row>
								<Table.Cell>
									<div class="flex items-center gap-2">
										<span class="font-mono">{domain.hostname}</span>
										{#if domain.isPrimary}<Badge variant="secondary">principal</Badge>{/if}
									</div>
								</Table.Cell>
								<Table.Cell>
									{#if data.canManageDomains}
										<form method="POST" action="?/removeDomain" use:enhance={submitting('remove')}>
											<input type="hidden" name="hostname" value={domain.hostname} />
											<Button
												type="submit"
												variant="ghost"
												size="icon"
												aria-label={`Remover ${domain.hostname}`}
											>
												<TrashIcon />
											</Button>
										</form>
									{/if}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
			{#if data.canManageDomains}
				<form
					method="POST"
					action="?/addDomain"
					class="flex gap-2"
					use:enhance={() => {
						pending = 'domain';
						return async ({ result, update }) => {
							pending = null;
							if (result.type === 'success') toast.success(String(result.data?.message));
							else if (result.type === 'failure') toast.error(String(result.data?.message));
							await update();
						};
					}}
				>
					<Input
						name="hostname"
						placeholder="cursinho.exemplo.com.br"
						aria-label="Novo domínio"
						required
					/>
					<Button type="submit" variant="outline" disabled={pending === 'domain'}>Adicionar</Button>
				</form>
			{:else}
				<p class="text-sm text-muted-foreground">
					Para vincular um domínio, fale com a administração da plataforma.
				</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
