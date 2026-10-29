<script lang="ts">
	import SignupForm from '#lib/components/signup-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Criar conta · {data.org?.name ?? 'tabelhaedu'}</title></svelte:head>

<main class="flex min-h-svh items-center justify-center p-6">
	<SignupForm next={data.next} orgName={data.org?.name ?? 'tabelhaedu'} />
</main>
