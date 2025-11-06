<script lang="ts">
	import { PortableText } from '@portabletext/svelte';
	import type { BlockContent } from '$lib/sanity.types';
	import SanityFile from './blocks/sanity-file.svelte';
	import SanityButton from './blocks/sanity-button.svelte';
	import SanityCardReference from './blocks/sanity-card-reference.svelte';
	import SanityBlockReference from './blocks/sanity-block-reference.svelte';
	import SanityNotes from './blocks/sanity-notes.svelte';
	import EnhancedImage from './blocks/enhanced-image.svelte';
	import EnhancedLink from './blocks/enhanced-link.svelte';
	import EnhancedParagraph from './blocks/enhanced-paragraph.svelte';
	import Callout from './blocks/callout.svelte';
	import Heading from './blocks/heading.svelte';
	import Blockquote from './blocks/blockquote.svelte';

	// Accept both 'body' and 'content' props for flexibility
	let { body, content }: { body?: BlockContent; content?: BlockContent } = $props();
	
	// Use whichever prop is provided
	const blockContent = $derived(content || body);
</script>

<div
	class="prose prose-lg prose-strong:font-bold
	prose-em:italic prose-code:bg-muted
	prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-a:text-primary
	prose-a:hover:underline prose-ul:list-disc
	prose-ul:ml-6 prose-ul:space-y-2 prose-ol:list-decimal
	prose-ol:ml-6 prose-ol:space-y-2 prose-li:leading-relaxed
	max-w-none"
>
	{#if blockContent}
		<PortableText
			value={blockContent}
			components={{
				types: {
					callout: Callout,
					image: EnhancedImage,
					imageWithAlt: EnhancedImage,
					file: SanityFile,
					button: SanityButton,
					card: SanityCardReference,
					cardReference: SanityCardReference,
					blockref: SanityBlockReference,
					notes: SanityNotes
				},
				block: {
					h1: Heading,
					h2: Heading,
					h3: Heading,
					h4: Heading,
					h5: Heading,
					h6: Heading,
					blockquote: Blockquote,
					normal: EnhancedParagraph
				},
				marks: {
					link: EnhancedLink,
					internalLink: EnhancedLink,
					externalLink: EnhancedLink
				}
			}}
		/>
	{:else}
		<p class="text-neutral-500">No content to display</p>
	{/if}
</div>
