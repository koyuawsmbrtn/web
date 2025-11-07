<script lang="ts">
	import Button from '../ui/button/button.svelte';
	import { toast } from 'svelte-sonner';
	import { Label } from '../ui/label';
	import { Input } from '../ui/input';
	import { Textarea } from '../ui/textarea';

	let name = $state<string>('');
	let email = $state<string>('');
	let message = $state<string>('');
	let isSending = $state<boolean>(false);

	function handleSubmit() {
		if (!email.includes('@') && !email.includes('.')) {
			toast.error('Please enter a valid email address.');
			return;
		}

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
		<Label>Your Name: <Input type="text" name="name" bind:value={name} required class="w-full md:w-1/2" /></Label>
	</p>
	<p>
		<Label>Your Email: <Input type="email" name="email" bind:value={email} required class="w-full md:w-1/2" /></Label>
	</p>
	<p>
		<Label>Message: <Textarea name="message" bind:value={message} required class="w-full md:w-1/2" /></Label>
	</p>
	<p>
		<Button onclick={handleSubmit} disabled={!name.trim() || !email.trim() || !message.trim() || isSending}>Send</Button>
	</p>
</div>