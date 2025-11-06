<script lang="ts">
	import Button from '../ui/button/button.svelte';
	import { toast } from 'svelte-sonner';

	let name = $state<string>('');
	let email = $state<string>('');
	let message = $state<string>('');
	let isSending = $state<boolean>(false);

	function handleSubmit() {
		isSending = true;
		fetch("/api/resend", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				name,
				email,
				message
			})
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				toast.success('Message sent successfully!');
				name = '';
				email = '';
				message = '';
			})
			.catch(error => {
				toast.error('Failed to send message.');
				console.error('There was a problem with the fetch operation:', error);
			})
			.finally(() => {
				isSending = false;
			});
	}
</script>

<div class="sanity-block my-2">
	<p>
		<label>Your Name: <input type="text" name="name" bind:value={name} required /></label>
	</p>
	<p>
		<label>Your Email: <input type="email" name="email" bind:value={email} required /></label>
	</p>
	<p>
		<label>Message: <textarea name="message" bind:value={message} required></textarea></label>
	</p>
	<p>
		<Button onclick={handleSubmit} disabled={!name || !email || !message || isSending}>Send</Button>
	</p>
</div>