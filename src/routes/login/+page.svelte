<script lang="ts">
	import LoginForm from '#lib/components/login-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Entrar · {data.org?.name ?? 'tabelhaedu'}</title></svelte:head>

<main class="flex min-h-svh items-center justify-center p-6">
	<LoginForm next={data.next} orgName={data.org?.name ?? 'tabelhaedu'} />
</main>
