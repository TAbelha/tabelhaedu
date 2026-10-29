<script lang="ts">
	import Building2Icon from '@lucide/svelte/icons/building-2';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { resolve } from '$app/paths';
	import AppSidebar, { type NavItem } from '#lib/components/app-sidebar.svelte';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const items = $derived<NavItem[]>([
		{ title: 'Início', url: resolve('/admin'), icon: LayoutDashboardIcon },
		...(data.canEditOrg
			? [{ title: 'Organização', url: resolve('/admin/organizacao'), icon: Building2Icon }]
			: []),
		...(data.canManageTeam
			? [{ title: 'Equipe', url: resolve('/admin/equipe'), icon: UsersIcon }]
			: [])
	]);
</script>

<Sidebar.Provider>
	<AppSidebar org={data.org} user={data.user!} {items} />
	<Sidebar.Inset>
		<header class="flex h-14 shrink-0 items-center gap-2 px-4">
			<Sidebar.Trigger class="-ms-1" />
			<Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
			<span class="truncate text-sm font-medium">{data.org.name}</span>
		</header>
		<div class="flex flex-1 flex-col gap-6 p-4 pt-0 md:p-6 md:pt-0">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
