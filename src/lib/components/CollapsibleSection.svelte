<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		expanded?: boolean;
		children: Snippet;
	}

	let { title, expanded = false, children }: Props = $props();
	let isExpanded = $state(expanded);
</script>

<div class="collapsible-section">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="section-header" onclick={() => isExpanded = !isExpanded}>
		<span class="section-title">{title}</span>
		<span class="chevron" class:expanded={isExpanded}>&#9660;</span>
	</div>

	{#if isExpanded}
		<div class="section-content" transition:slide={{ duration: 300 }}>
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.collapsible-section {
		margin-bottom: 24px;
	}

	.section-header {
		display: flex;
		align-items: center;
		cursor: pointer;
		padding: 8px 0;
		user-select: none;
	}

	.section-title {
		font-size: 20px;
		font-weight: 700;
		color: white;
		flex: 1;
	}

	.chevron {
		color: rgba(255,255,255,0.7);
		font-size: 12px;
		transition: transform 0.3s ease;
		transform: rotate(-90deg);
	}

	.chevron.expanded {
		transform: rotate(0deg);
	}

	.section-content {
		padding-top: 8px;
	}
</style>
