<script lang="ts">
	import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: NavigationMenuPrimitive.LinkProps = $props();
</script>

<NavigationMenuPrimitive.Link
	bind:ref
	data-slot="navigation-menu-link"
	class={cn(
		"data-[active=true]:focus:bg-white/5 cursor-pointer data-[active=true]:text-white  hover:text-white/80  focus:text-white  focus-visible:ring-white/20 [&_svg:not([class*='text-'])]:text-white flex flex-col gap-1 rounded-sm p-2 text-sm text-white outline-none transition-all focus-visible:outline-1 focus-visible:ring-[3px] [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	{...restProps}
/>
