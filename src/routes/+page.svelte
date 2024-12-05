<script lang="ts">
	import { makeApiClient } from "$lib/api/client";
	import stripeClient from "$lib/stripe/client";
	import "@sveltejs/kit";

	type product = {
		id: string;
		title: string;
		lookup_key: string;
	};
	const products: product[] = [
		{
			id: "prod_RKzfg6gMWnjo4H",
			title: "のこのこスタンダード",
			lookup_key: "nokonoko_std_per_month",
		},
		{
			id: "prod_RKzf45ctmQfvLd",
			title: "のこのこスペシャル",
			lookup_key: "nokonoko_special_per_month",
		},
	];

	let checkout: any;
	let isProcessing = false;

	function closeOutside(event: any) {
		if (event.target != event.currentTarget) {
			return;
		}
		close();
	}

	function close() {
		history.back();
	}

	const handleCancel = async () => {
		if (checkout) {
			await checkout.destroy();
		}
		if (isProcessing) {
			isProcessing = false;
		}
		close();
	};

	const startCheckout = async (product: product) => {
		isProcessing = true;
		const client = makeApiClient(fetch);
		try {
			const response = await client.stripe.checkout.$post({
				json: product,
			});
			const resJson = await response.json();

			const clientSecret = resJson.clientSecret;

			if (clientSecret) {
				if (checkout) {
					await checkout.destroy();
				}
				checkout = await stripeClient?.initEmbeddedCheckout({ clientSecret });

				checkout.mount("#checkout");
			} else {
				isProcessing = false;
			}
		} catch (err) {
			if (checkout) {
				await checkout.destroy();
				isProcessing = false;
			}
		}
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
{#each products as product}
	<div on:click={closeOutside}>
		<h3>{product.title}を購入しますか？</h3>
		{#if isProcessing}
			<button on:click={handleCancel}> キャンセル </button>
		{:else}
			<button on:click={() => startCheckout(product)}> 購入する </button>
		{/if}
	</div>
{/each}

<div id="checkout"></div>
