<script lang="ts">
	interface EnhancedParagraphProps {
		children: any;
		portableText?: any;
	}

	let { children, portableText }: EnhancedParagraphProps = $props();

	// Check if this is a break divider (---)
	const isBreakDivider = $derived(() => {
		console.log('EnhancedParagraph children:', children);
		console.log('EnhancedParagraph portableText:', portableText);
		
		// Try to check the actual text content from the portableText value
		if (portableText?.value?.children) {
			const textContent = portableText.value.children
				.filter((child: any) => child._type === 'span')
				.map((child: any) => child.text)
				.join('')
				.trim()
				// Remove invisible Unicode characters
				.replace(/[\u200B-\u200D\uFEFF\u2060\u00AD\u180E\u061C\u2066-\u2069]/g, '')
				// Remove zero-width spaces and other invisible chars
				.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
			
			console.log('Extracted text content:', textContent);
			console.log('Cleaned text content:', textContent);
			
			if (textContent === '---') {
				console.log('Found break divider in portableText!');
				return true;
			}
		}
		
		return false;
	});
</script>

{#if isBreakDivider()}
	<div class="my-8"></div>
{:else}
	<p class="my-3">
		{@render children()}
	</p>
{/if}