<script lang="ts">
	import type { Component, ComponentProps } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import NavUser from './nav-user.svelte';
	import OrgLogo from './org-logo.svelte';

	export type NavItem = { title: string; url: string; icon: Component };

	let {
		ref = $bindable(null),
		org,
		user,
		items,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		org: { name: string; logo: string | null };
		user: { name: string; email: string };
		items: NavItem[];
	} = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href={resolve('/admin')} {...props}>
							<OrgLogo {org} />
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-semibold">{org.name}</span>
								<span class="truncate text-xs text-muted-foreground">Administração</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu>
				{#each items as item (item.url)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={page.url.pathname === item.url}
							tooltipContent={item.title}
						>
							{#snippet child({ props })}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- item urls are built with resolve() by the caller -->
								<a href={item.url} {...props}>
									<item.icon />
									<span>{item.title}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
</Sidebar.Root>
