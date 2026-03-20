<script lang="ts">
	import { onMount } from 'svelte';

	interface Skill {
		name: string;
		category?: string;
		proficiency?: number; // 1-5, affects size
	}

	interface Props {
		skills?: Skill[];
		isLoading?: boolean;
	}

	let { skills = [], isLoading = false }: Props = $props();

	// --- Physics state per skill ---
	interface SkillBody {
		x: number;
		y: number;
		vx: number;
		vy: number;
		width: number;
		height: number;
		radius: number;
		el: HTMLSpanElement | null;
	}

	let containerEl = $state<HTMLDivElement | null>(null);
	let containerWidth = $state(0);
	let containerHeight = $state(0);
	let bodies = $state<SkillBody[]>([]);
	let rafId: number | null = null;

	// Drag state
	let dragIndex = $state<number | null>(null);
	let dragOffsetX = 0;
	let dragOffsetY = 0;
	let pointerHistory: { x: number; y: number; t: number }[] = [];

	// --- Constants ---
	const FRICTION = 0.98;
	const RESTITUTION = 0.6;
	const COLLISION_RESTITUTION = 0.5;
	const MAX_FLICK_SPEED = 30;
	const DRIFT_STRENGTH = 0.02;
	const POINTER_HISTORY_LENGTH = 5;

	// --- Category colors ---
	const CATEGORY_COLORS: Record<string, string> = {
		languages: 'var(--accent-color, #c8c8c8)',
		frameworks: 'oklch(0.75 0.12 290)',
		devops: 'oklch(0.72 0.14 155)',
		tools: 'oklch(0.72 0.12 230)',
		default: 'oklch(0.7 0.02 250)'
	};

	// --- Proficiency → font-size map ---
	const PROFICIENCY_SIZES: Record<number, string> = {
		1: '0.75rem',
		2: '0.875rem',
		3: '1rem',
		4: '1.25rem',
		5: '1.5rem'
	};

	function getCategoryColor(category?: string): string {
		if (!category) return CATEGORY_COLORS['default'] ?? 'oklch(0.7 0.02 250)';
		const key = category.toLowerCase();
		return CATEGORY_COLORS[key] ?? CATEGORY_COLORS['default'] ?? 'oklch(0.7 0.02 250)';
	}

	function getFontSize(proficiency?: number): string {
		const p = Math.max(1, Math.min(5, proficiency ?? 3));
		return PROFICIENCY_SIZES[p] ?? '1rem';
	}

	function getProficiencySizeFloat(proficiency: number): number {
		const p = Math.max(1, Math.min(5, proficiency));
		const sizeStr = PROFICIENCY_SIZES[p] ?? '1';
		return parseFloat(sizeStr);
	}

	// --- Skeleton pills for loading state ---
	const skeletonPills = Array.from({ length: 10 }, (_, i) => ({
		width: 60 + Math.random() * 60,
		delay: (i * 0.12).toFixed(2)
	}));

	// --- Initialize positions avoiding overlaps ---
	function initBodies() {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		containerWidth = rect.width;
		containerHeight = rect.height;

		const newBodies: SkillBody[] = [];
		const padding = 20;

		for (let i = 0; i < skills.length; i++) {
			const skill = skills[i];
			if (!skill) continue;

			const proficiency = skill.proficiency ?? 3;
			const fontSize = getProficiencySizeFloat(proficiency);
			const estWidth = skill.name.length * fontSize * 8.5 + 24;
			const estHeight = fontSize * 16 + 12;
			const radius = Math.sqrt(estWidth * estWidth + estHeight * estHeight) / 2;

			let x: number = 0;
			let y: number = 0;
			let attempts = 0;
			let overlap: boolean;

			do {
				x = padding + Math.random() * Math.max(10, containerWidth - estWidth - padding * 2);
				y = padding + Math.random() * Math.max(10, containerHeight - estHeight - padding * 2);
				overlap = false;
				for (const b of newBodies) {
					const dx = x + estWidth / 2 - (b.x + b.width / 2);
					const dy = y + estHeight / 2 - (b.y + b.height / 2);
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < radius + b.radius + 4) {
						overlap = true;
						break;
					}
				}
				attempts++;
			} while (overlap && attempts < 50);

			newBodies.push({
				x,
				y,
				vx: (Math.random() - 0.5) * 1.5,
				vy: (Math.random() - 0.5) * 1.5,
				width: estWidth,
				height: estHeight,
				radius,
				el: null
			});
		}

		bodies = newBodies;
	}

	// --- Measure actual DOM elements after render ---
	function measureElements() {
		for (let i = 0; i < bodies.length; i++) {
			const body = bodies[i];
			if (!body) continue;
			const el = body.el;
			if (el) {
				const w = el.offsetWidth;
				const h = el.offsetHeight;
				body.width = w;
				body.height = h;
				body.radius = Math.sqrt(w * w + h * h) / 2;
			}
		}
	}

	// --- Physics step ---
	function physicsStep() {
		if (!containerEl) return;
		const len = bodies.length;

		for (let i = 0; i < len; i++) {
			const b = bodies[i];
			if (!b) continue;

			// Skip dragged body physics
			if (i === dragIndex) continue;

			// Apply friction
			b.vx *= FRICTION;
			b.vy *= FRICTION;

			// Random drift
			b.vx += (Math.random() - 0.5) * DRIFT_STRENGTH;
			b.vy += (Math.random() - 0.5) * DRIFT_STRENGTH;

			// Update position
			b.x += b.vx;
			b.y += b.vy;

			// Wall collisions
			if (b.x < 0) {
				b.x = 0;
				b.vx = Math.abs(b.vx) * RESTITUTION;
			} else if (b.x + b.width > containerWidth) {
				b.x = containerWidth - b.width;
				b.vx = -Math.abs(b.vx) * RESTITUTION;
			}

			if (b.y < 0) {
				b.y = 0;
				b.vy = Math.abs(b.vy) * RESTITUTION;
			} else if (b.y + b.height > containerHeight) {
				b.y = containerHeight - b.height;
				b.vy = -Math.abs(b.vy) * RESTITUTION;
			}
		}

		// Collision detection (circle-based)
		for (let i = 0; i < len; i++) {
			const a = bodies[i];
			if (!a) continue;
			for (let j = i + 1; j < len; j++) {
				const b = bodies[j];
				if (!b) continue;

				const ax = a.x + a.width / 2;
				const ay = a.y + a.height / 2;
				const bx = b.x + b.width / 2;
				const by = b.y + b.height / 2;

				const dx = bx - ax;
				const dy = by - ay;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const minDist = a.radius + b.radius;

				if (dist < minDist && dist > 0.01) {
					const nx = dx / dist;
					const ny = dy / dist;

					// Separate overlapping bodies
					const overlapDist = minDist - dist;
					const separationX = (nx * overlapDist) / 2;
					const separationY = (ny * overlapDist) / 2;

					if (i !== dragIndex) {
						a.x -= separationX;
						a.y -= separationY;
					}
					if (j !== dragIndex) {
						b.x += separationX;
						b.y += separationY;
					}

					// Exchange velocities along collision normal
					const relVx = a.vx - b.vx;
					const relVy = a.vy - b.vy;
					const relDot = relVx * nx + relVy * ny;

					// Only resolve if bodies are approaching
					if (relDot > 0) {
						const impulse = relDot * COLLISION_RESTITUTION;

						if (i === dragIndex) {
							b.vx += impulse * nx * 2;
							b.vy += impulse * ny * 2;
						} else if (j === dragIndex) {
							a.vx -= impulse * nx * 2;
							a.vy -= impulse * ny * 2;
						} else {
							a.vx -= impulse * nx;
							a.vy -= impulse * ny;
							b.vx += impulse * nx;
							b.vy += impulse * ny;
						}
					}
				}
			}
		}
	}

	// --- Animation loop ---
	function loop() {
		physicsStep();
		// Trigger Svelte reactivity — reassign to notify the template
		bodies = bodies;
		rafId = requestAnimationFrame(loop);
	}

	// --- Pointer helpers ---
	function getPointerPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
		const rect = containerEl!.getBoundingClientRect();
		if ('touches' in e && e.touches[0]) {
			return {
				x: e.touches[0].clientX - rect.left,
				y: e.touches[0].clientY - rect.top
			};
		}
		return {
			x: (e as MouseEvent).clientX - rect.left,
			y: (e as MouseEvent).clientY - rect.top
		};
	}

	function onPointerDown(e: MouseEvent | TouchEvent, index: number) {
		e.preventDefault();
		const pos = getPointerPos(e);
		const b = bodies[index];
		if (!b) return;

		dragIndex = index;
		dragOffsetX = pos.x - b.x;
		dragOffsetY = pos.y - b.y;
		b.vx = 0;
		b.vy = 0;

		pointerHistory = [{ x: pos.x, y: pos.y, t: performance.now() }];

		window.addEventListener('mousemove', onPointerMove);
		window.addEventListener('mouseup', onPointerUp);
		window.addEventListener('touchmove', onPointerMove, { passive: false });
		window.addEventListener('touchend', onPointerUp);
	}

	function onPointerMove(e: MouseEvent | TouchEvent) {
		if (dragIndex === null || !containerEl) return;
		e.preventDefault();
		const pos = getPointerPos(e);
		const b = bodies[dragIndex];
		if (!b) return;

		b.x = pos.x - dragOffsetX;
		b.y = pos.y - dragOffsetY;

		// Clamp to container
		b.x = Math.max(0, Math.min(containerWidth - b.width, b.x));
		b.y = Math.max(0, Math.min(containerHeight - b.height, b.y));

		// Record pointer history for flick velocity
		const now = performance.now();
		pointerHistory.push({ x: pos.x, y: pos.y, t: now });
		if (pointerHistory.length > POINTER_HISTORY_LENGTH) {
			pointerHistory.shift();
		}
	}

	function onPointerUp(_e: MouseEvent | TouchEvent) {
		if (dragIndex === null) return;

		const b = bodies[dragIndex];
		if (!b) {
			dragIndex = null;
			return;
		}

		// Compute flick velocity from pointer history
		if (pointerHistory.length >= 2) {
			const first = pointerHistory[0];
			const last = pointerHistory[pointerHistory.length - 1];

			if (first && last) {
				const dt = (last.t - first.t) / 1000; // seconds

				if (dt > 0.001) {
					let flickVx = (last.x - first.x) / dt / 60; // per-frame velocity
					let flickVy = (last.y - first.y) / dt / 60;

					// Cap speed
					const speed = Math.sqrt(flickVx * flickVx + flickVy * flickVy);
					if (speed > MAX_FLICK_SPEED) {
						const scale = MAX_FLICK_SPEED / speed;
						flickVx *= scale;
						flickVy *= scale;
					}

					b.vx = flickVx;
					b.vy = flickVy;
				}
			}
		}

		dragIndex = null;
		pointerHistory = [];

		window.removeEventListener('mousemove', onPointerMove);
		window.removeEventListener('mouseup', onPointerUp);
		window.removeEventListener('touchmove', onPointerMove);
		window.removeEventListener('touchend', onPointerUp);
	}

	// --- Resize handling ---
	function handleResize() {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const oldWidth = containerWidth;
		const oldHeight = containerHeight;
		containerWidth = rect.width;
		containerHeight = rect.height;

		// Rescale positions proportionally
		if (oldWidth > 0 && oldHeight > 0) {
			const scaleX = containerWidth / oldWidth;
			const scaleY = containerHeight / oldHeight;
			for (const b of bodies) {
				b.x *= scaleX;
				b.y *= scaleY;
				b.x = Math.max(0, Math.min(containerWidth - b.width, b.x));
				b.y = Math.max(0, Math.min(containerHeight - b.height, b.y));
			}
		}
	}

	// --- Lifecycle ---
	onMount(() => {
		initBodies();

		// Measure after initial render
		requestAnimationFrame(() => {
			measureElements();
			for (const b of bodies) {
				b.x = Math.max(0, Math.min(containerWidth - b.width, b.x));
				b.y = Math.max(0, Math.min(containerHeight - b.height, b.y));
			}
		});

		// Start physics loop
		rafId = requestAnimationFrame(loop);

		// Resize observer
		const resizeObserver = new ResizeObserver(handleResize);
		if (containerEl) resizeObserver.observe(containerEl);

		return () => {
			if (rafId !== null) cancelAnimationFrame(rafId);
			resizeObserver.disconnect();
			window.removeEventListener('mousemove', onPointerMove);
			window.removeEventListener('mouseup', onPointerUp);
			window.removeEventListener('touchmove', onPointerMove);
			window.removeEventListener('touchend', onPointerUp);
		};
	});

	// Re-init when skills change
	$effect(() => {
		// Read skills.length to subscribe to changes
		if (skills.length >= 0 && containerEl) {
			initBodies();
			requestAnimationFrame(() => {
				measureElements();
			});
		}
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="skill-cloud-container" bind:this={containerEl} role="list" aria-label="Skills">
	{#if isLoading}
		<div class="skeleton-wrap">
			{#each skeletonPills as pill}
				<span
					class="skeleton-pill"
					style="width: {pill.width}px; animation-delay: {pill.delay}s;"
				></span>
			{/each}
		</div>
	{:else}
		{#each bodies as body, i}
			{@const skill = skills[i]}
			{#if skill}
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<span
					class="skill-pill"
					class:is-dragging={dragIndex === i}
					bind:this={body.el}
					style="
						transform: translate({body.x}px, {body.y}px);
						font-size: {getFontSize(skill.proficiency)};
						--skill-color: {getCategoryColor(skill.category)};
					"
					onmousedown={(e: MouseEvent) => onPointerDown(e, i)}
					ontouchstart={(e: TouchEvent) => onPointerDown(e, i)}
					role="listitem"
				>
					{skill.name}
				</span>
			{/if}
		{/each}
	{/if}
</div>

<div
		class="skills-hint"
	>
		<span class="hint-icon">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
				<path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
				<path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
				<path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 16" />
			</svg>
		</span>
		Drag and flick the skills to play with them
	</div>

<style>
	.skill-cloud-container {
		position: relative;
		width: 100%;
		min-height: 400px;
		border-radius: 1rem;
		border: 1px solid oklch(1 0 0 / 8%);
		background: linear-gradient(
			145deg,
			oklch(0.16 0 0 / 80%) 0%,
			oklch(0.12 0 0 / 60%) 50%,
			oklch(0.14 0 0 / 70%) 100%
		);
		overflow: hidden;
		margin-top: 1rem;
	}

	/* --- Skill pills --- */
	.skill-pill {
		position: absolute;
		top: 0;
		left: 0;
		display: inline-block;
		padding: 0.375rem 0.75rem;
		border-radius: 9999px;
		background: oklch(0.2 0 0 / 60%);
		border: 1px solid oklch(1 0 0 / 10%);
		color: var(--skill-color, oklch(0.8 0 0));
		white-space: nowrap;
		user-select: none;
		touch-action: none;
		cursor: grab;
		will-change: transform;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			scale 0.15s ease,
			background 0.2s ease;
		z-index: 1;
	}

	.skill-pill:hover {
		border-color: oklch(1 0 0 / 22%);
		box-shadow: 0 0 12px -2px var(--skill-color, oklch(0.6 0 0 / 30%));
		background: oklch(0.24 0 0 / 70%);
	}

	.skill-pill.is-dragging {
		cursor: grabbing;
		scale: 1.1;
		z-index: 100;
		border-color: var(--skill-color, oklch(1 0 0 / 30%));
		box-shadow: 0 0 24px -4px var(--skill-color, oklch(0.7 0 0 / 50%));
		background: oklch(0.26 0 0 / 80%);
	}

	/* --- Loading skeleton --- */
	.skeleton-wrap {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding: 2rem;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		align-content: center;
	}

	.skeleton-pill {
		display: inline-block;
		height: 2rem;
		border-radius: 9999px;
		background: oklch(0.25 0 0);
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.skills-hint {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: oklch(0.45 0 0);
		font-size: 0.8rem;
		margin: 1rem 0;
	}

	.hint-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: oklch(0.5 0 0);
		flex-shrink: 0;
	}

	@keyframes shimmer {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.7;
		}
	}
</style>
