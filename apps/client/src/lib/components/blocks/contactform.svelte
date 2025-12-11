<script lang="ts">
	import Button from '../ui/button/button.svelte';
	import { toast } from 'svelte-sonner';
	import { Label } from '../ui/label';
	import { Input } from '../ui/input';
	import { Textarea } from '../ui/textarea';
	import FileDropZone from '../ui/file-drop-zone/file-drop-zone.svelte';
	import { displaySize } from '../ui/file-drop-zone';

	let name = $state<string>('');
	let email = $state<string>('');
	let message = $state<string>('');
	let isSending = $state<boolean>(false);
	let attachments = $state<File[]>([]);
	let attachmentsRaw = $state<string>('');
	// Prepared attachments to match server shape: { filename, content (base64), type }
	let encodedAttachments = $state<{ filename: string; content: string; type: string }[]>([]);

	function fileToBase64(file: File): Promise<{ filename: string; content: string; type: string }> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const base64Content =
					typeof reader.result === 'string' ? (reader.result.split(',')[1] ?? '') : '';
				resolve({ filename: file.name, content: base64Content, type: file.type });
			};
			reader.onerror = () => reject(new Error('Failed to read file'));
			reader.readAsDataURL(file);
		});
	}

	async function handleSubmit() {
		if (!email.includes('@') && !email.includes('.')) {
			toast.error('Please enter a valid email address.');
			return;
		}

		isSending = true;
		// Use pre-encoded attachments if available; otherwise encode now
		const files =
			encodedAttachments.length === attachments.length
				? encodedAttachments
				: await Promise.all(attachments.map(fileToBase64));
		fetch('/api/resend', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name,
				email,
				message,
				attachments: files
			})
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((data) => {
				toast.success('Message sent successfully!');
				name = '';
				email = '';
				message = '';
				attachments = [];
				encodedAttachments = [];
			})
			.catch((error) => {
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
		<Label
			>Your Name: <Input
				type="text"
				name="name"
				bind:value={name}
				required
				class="w-full md:w-1/2"
			/></Label
		>
	</p>
	<p>
		<Label
			>Your Email: <Input
				type="email"
				name="email"
				bind:value={email}
				required
				class="w-full md:w-1/2"
			/></Label
		>
	</p>
	<p>
		<Label
			>Message: <Textarea
				name="message"
				bind:value={message}
				required
				class="w-full md:w-1/2"
			/></Label
		>
	</p>
	<p>
		<Label>
			<br />
			<p>Attachments:</p>
			<br />
			<FileDropZone
				class="w-full md:w-1/2"
				onUpload={async (files) => {
					attachments = files;
					encodedAttachments = await Promise.all(files.map(fileToBase64));
				}}
				maxFiles={5}
				maxFileSize={10 * 1024 * 1024}
			/>
		</Label>
	</p>
	<div class="flex flex-col gap-2">
		{#each attachments as file, i (file.name)}
			<div class="mt-2 flex w-full place-items-center justify-between md:w-1/2">
				<div class="flex place-items-center gap-2">
					{#if file.type.startsWith('image/')}
						{#await URL.createObjectURL(file) then src}
							<div class="relative size-9 overflow-clip">
								<img
									{src}
									alt={file.name}
									class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-clip"
								/>
							</div>
						{/await}
					{:else}
						<div class="bg-muted flex size-9 place-items-center justify-center rounded-md">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="text-muted-foreground size-5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
								/>
							</svg>
						</div>
					{/if}
					<div class="flex flex-col">
						<span>{file.name}</span>
						<span class="text-muted-foreground text-xs">{displaySize(file.size)}</span>
					</div>
				</div>
				<Button
					type="button"
					variant="destructive"
					size="icon"
					onclick={() => {
						attachments = attachments.filter((_, index) => index !== i);
						encodedAttachments = encodedAttachments.filter((_, index) => index !== i);
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-4"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</Button>
			</div>
		{/each}
	</div>
	<br />
	<p>
		<Button
			onclick={handleSubmit}
			disabled={!name.trim() || !email.trim() || !message.trim() || isSending}>Send</Button
		>
	</p>
</div>
