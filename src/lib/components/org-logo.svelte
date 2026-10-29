<script lang="ts">
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import { cn } from '#lib/utils.js';

	let {
		org,
		class: className = ''
	}: { org: { name: string; logo: string | null } | null; class?: string } = $props();
</script>

{#if org?.logo}
	<img src={org.logo} alt={org.name} class={cn('size-8 rounded-lg object-contain', className)} />
{:else}
	<div
		class={cn(
			'flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground',
			className
		)}
	>
		<GraduationCapIcon class="size-4" />
	</div>
{/if}
