<script lang="ts">
    import { onMount } from 'svelte';

    const MESSAGE = '$ currently building cool stuff...';
    const TYPING_SPEED_MS = 60;
    const CURSOR_BLINK_MS = 530;
    const START_DELAY_MS = 3500;
    const SESSION_KEY = 'tagline-animation-played';

    let displayedText = '';
    let cursorVisible = true;

    onMount(() => {
        const alreadyPlayed = sessionStorage.getItem(SESSION_KEY);

        let cursorInterval = setInterval(() => {
            cursorVisible = !cursorVisible;
        }, CURSOR_BLINK_MS);

        if (alreadyPlayed) {
            displayedText = MESSAGE;
            return () => clearInterval(cursorInterval);
        }

        let startTimeout: ReturnType<typeof setTimeout>;
        let typingTimeout: ReturnType<typeof setTimeout>;

        startTimeout = setTimeout(() => {
            let index = 0;

            const typeNext = () => {
                if (index < MESSAGE.length) {
                    displayedText = MESSAGE.slice(0, index + 1);
                    index++;
                    typingTimeout = setTimeout(typeNext, TYPING_SPEED_MS);
                } else {
                    sessionStorage.setItem(SESSION_KEY, 'true');
                }
            };

            typeNext();
        }, START_DELAY_MS);

        return () => {
            clearInterval(cursorInterval);
            clearTimeout(startTimeout);
            clearTimeout(typingTimeout);
        };
    });
</script>

<span class="tagline">
    <span class="tagline-text">{displayedText}</span>
    <span class="tagline-cursor" class:visible={cursorVisible}>_</span>
</span>

<style>
    .tagline {
        display: block;
        margin-top: 1rem;
        font-family: monospace;
        font-size: 0.9rem;
        color: oklch(0.5 0 0);
    }

    .tagline-cursor {
        visibility: hidden;
    }

    .tagline-cursor.visible {
        visibility: visible;
    }
</style>
