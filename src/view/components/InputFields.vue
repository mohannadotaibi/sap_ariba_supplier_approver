<template>
	<div id="input-fields" style="text-align: center; display: flex; flex-direction: column">
		<div style="display: flex; flex-direction: column">
			<label for="token">Token</label>

			<input type="text" name="token" id="token" v-model="token" placeholder="Enter your token" />
		</div>
		<div style="display: flex; flex-direction: column; margin-bottom: 14px">
			<label for="supplier">Supplier</label>
			<input type="text" name="supplierName" id="supplierName" v-model="supplierName" placeholder="Enter your supplier name" />
		</div>
		<button id="submit" @click="searchSuppliers">Submit</button>
	</div>
</template>

<script setup>
	import { ref, watch, defineProps } from 'vue';

	const props = defineProps({ token: String });

	const emit = defineEmits(['update-token', 'update-output', 'update-results', 'update-supplier-name']);

	const token = ref(props.token);
	const supplierName = ref('');
	const results = ref([]);

	const updateInputs = async () => {
		console.log('getting inputs');
		const inputs = await window.api.loadInputs();
		if (inputs.token) {
			token.value = inputs.token;
		}
		if (inputs.supplier) {
			supplierName.value = inputs.supplier;
		}

		window.api.receiveToken(token_value => {
			console.log('Token received:', token_value);
			token.value = token_value;
		});
	};

	updateInputs();

	watch(token, newVal => {
		emit('update-token', newVal);
	});

	watch(supplierName, newVal => {
		emit('update-supplier-name', newVal);
	});

	watch(results, newVal => {
		emit('update-results', newVal);
	});

	const searchSuppliers = async () => {
		const res = await window.api.searchSuppliers(supplierName.value, token.value);
    console.log('got results', res)
		results.value = res;

		if (res.length > 0) {
      console.log('emitting results')
			emit('update-output', `${res.length} suppliers found`);
			emit('update-results', res);
		} else {
			emit('update-output', 'No suppliers found or error in response');
		}
	};
</script>
