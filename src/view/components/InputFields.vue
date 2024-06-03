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
		<button id="submit" @click="searchSuppliers">Search</button>
	</div>
</template>

<script setup>
	import { ref, watch, defineProps } from 'vue';
	import {useStore} from '../../store/main';
	import {storeToRefs} from 'pinia';

    const store = useStore(); // store is now a reactive object
	
	const { apiToken, supplierNameSearchField } = storeToRefs(store);


	console.log('store',  apiToken.value, supplierNameSearchField.value)


	const emit = defineEmits(['update-output', 'update-results']);

	const token = ref(apiToken);
	const supplierName = ref(supplierNameSearchField);
	const results = ref([]);


	watch(token, newVal => {
		console.log('token changed to ' + newVal)
		store.setToken(newVal);
	});

	watch(supplierName, newVal => {
		console.log('supplierName changed to ' + newVal)
		store.setSupplierNameSearchField(newVal);
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
