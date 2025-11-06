<script lang="ts" module>
	import { cn } from "$lib/utils.js";
	import { tv } from "tailwind-variants";

	export const navigationMenuTriggerStyle = tv({
		base: "text-white hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white data-[state=open]:hover:bg-white/5 data-[state=open]:text-white data-[state=open]:focus:bg-white/5 data-[state=open]:bg-primary active:bg-white/8 focus-visible:ring-white/20 group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium outline-none transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
	});
</script>

<script lang="ts">
	import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: NavigationMenuPrimitive.TriggerProps = $props();
</script>

<NavigationMenuPrimitive.Trigger
	bind:ref
	data-slot="navigation-menu-trigger"
	class={cn(
		navigationMenuTriggerStyle(),
		"group",
		className
	)}
	{...restProps}
>
	{@render children?.()}

	<ChevronDownIcon
		class="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
		aria-hidden="true"
	/>
</NavigationMenuPrimitive.Trigger>
