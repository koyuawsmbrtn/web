<script lang="ts">
	import { cn } from '$lib/utils';
	import { ArrowRight, ExternalLink } from '@lucide/svelte';
	import Button from './ui/button/button.svelte';

	let {
		text,
		linkData,
		variant = 'default',
		size = 'default',
		extraIcon,
		showIcon = true,
		className,
		onPress,
		...restProps
	}: {
		text: string;
		linkData: { href: string; target: string } | null;
		variant?: 'ghost' | 'default' | 'secondary' | 'link' | 'destructive' | 'outline';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		extraIcon?: any;
		showIcon?: boolean;
		className?: string;
		onPress?: () => void;
		[key: string]: any;
	} = $props();

	const isExternal = linkData?.href?.startsWith('http');

	const baseClasses = cn(
		'group',
		'gap-2',
		'inline-flex',
		'whitespace-nowrap',
		showIcon ? 'pr-4' : 'px-6',
		'active:transform',
		'active:translate-y-[1px]',
		className
	);
</script>

{#if linkData}
	<Button
		href={linkData.href}
		target={linkData?.target ?? '_self'}
		rel={isExternal ? 'noopener noreferrer' : undefined}
		onclick={onPress}
		class={baseClasses}
		{...restProps}
	>
		{#if extraIcon}
			<span class="transition-transform duration-300 group-hover:scale-110">
				{@render extraIcon({ size: size === 'lg' ? 24 : 20 })}
			</span>
		{/if}

		<span>{text}</span>

		{#if showIcon}
			<span
				class="transition-all duration-300 group-hover:transform group-hover:translate-x-1"
			>
				{#if isExternal}
					<ExternalLink size={size === 'lg' ? 24 : 20} />
				{:else}
					<ArrowRight strokeWidth={3} size={size === 'lg' ? 24 : 20} />
				{/if}
			</span>
		{/if}
		</Button>
{/if}
