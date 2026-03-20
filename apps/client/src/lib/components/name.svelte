<script lang="ts">
    import { onMount } from 'svelte';
    import { animate } from 'motion';

    const slides = [
      "a programmer",
      "a sysadmin",
      "funny",
      "creative",
      "a daughter",
      "a sister",
      "a baddie",
      "koyu"
    ];

    const ITEM_HEIGHT = 48;
    const maxLen = Math.max(...slides.map(s => s.length));
    const lastSlide = slides[slides.length - 1];

    let trackEl: HTMLElement;
    let containerEl: HTMLElement;
    let measureEl: HTMLElement;

    const SCROLL_DURATION = 2.4;
    const SCROLL_DELAY = 0.4;
    const SCROLL_EASE: [number, number, number, number] = [0.2, 0.0, 0.1, 1.0];

    onMount(() => {
        const totalSlides = slides.length;
        const finalY = -(totalSlides - 1) * ITEM_HEIGHT;

        if (sessionStorage.getItem('name-animation-played')) {
            trackEl.style.transform = `translateY(${finalY}px)`;
            containerEl.style.maskImage = 'none';
            containerEl.style.webkitMaskImage = 'none';
            containerEl.style.width = '90px';
            containerEl.style.verticalAlign = 'top';
            containerEl.style.marginTop = '-4px';
            return;
        }

        const scrollAnim = animate(
            trackEl,
            { y: [0, finalY] },
            {
                duration: SCROLL_DURATION,
                ease: SCROLL_EASE,
                delay: SCROLL_DELAY,
            }
        );

        scrollAnim.then(() => {
            // Remove the mask so the final word displays cleanly
            containerEl.style.maskImage = 'none';
            containerEl.style.webkitMaskImage = 'none';
            const currentWidth = containerEl.offsetWidth;

            const widthEase: [number, number, number, number] = [0.4, 0.0, 0.2, 1.0];

            animate(
                containerEl,
                {
                  width: [currentWidth + 'px', '90px'],
                  verticalAlign: ['bottom', 'top'],
                  marginTop: ['0px', '-4px'],
                },
                {
                    duration: 0.5,
                    ease: widthEase,
                }
            ).then(() => {
                sessionStorage.setItem('name-animation-played', 'true');
            });
        });
    });
</script>

<span class="measure-hidden" bind:this={measureEl}>{lastSlide}</span>
<div class="sanity-block my-2"><h1>Hi, I'm <span class="slot-container" bind:this={containerEl} style="width: {maxLen + 2}ch; height: {ITEM_HEIGHT}px;"><span class="slot-track" bind:this={trackEl}>{#each slides as slide}<span class="slot-item" style="height: {ITEM_HEIGHT}px;">{slide}</span>{/each}</span></span> (usually called Leonie in real life) and I am a programmer and sysadmin located in Northern Germany establishing internet services for you and your friends. I'm your average computer nerd trying to liberate the cyberspace for everyone. <a href="/about">More about me <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" class="stroke-accent inline" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></a></h1></div>

<style>
    .measure-hidden {
        position: absolute;
        visibility: hidden;
        white-space: nowrap;
        pointer-events: none;
        font: inherit;
    }

    .slot-container {
        display: inline-block;
        position: relative;
        overflow: hidden;
        vertical-align: bottom;
        -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 35%,
            black 65%,
            transparent 100%
        );
        mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 35%,
            black 65%,
            transparent 100%
        );
    }

    .slot-track {
        display: flex;
        flex-direction: column;
        will-change: transform;
    }

    .slot-item {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        flex-shrink: 0;
        white-space: nowrap;
    }
</style>
