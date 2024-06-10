<template>
	<div id="input-fields" class="mb-2">
		<div class="grid grid-cols-2 gap-4">
			<div class="mb-2">
			<label for="token" class="block text-xs font-medium text-gray-300"> Token </label>

			<input
				type="text"
				id="token"
				placeholder="enter token or login above"
				class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm text-gray-800"
				v-model="token" />
		</div>
		<div class="mb-2">
			<label for="supplierName" class="block text-xs font-medium text-gray-300"> Supplier Name (keywords) </label>

			<input
				type="text"
				id="supplierName"
				placeholder="enter token or login above"
				class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm text-gray-800"
				v-model="supplierName" />
		</div>
		</div>
		
		<div class="justify-end items-end flex">
			<a
			class="inline-block rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500"
			href="#"
			@click="searchSuppliers">
			Search
		</a>
		</div>
		
	</div>
</template>

<script setup>
	import { ref, watch } from 'vue';
	import { useStore } from '../../store/main';
	import { storeToRefs } from 'pinia';

	const store = useStore(); // store is now a reactive object

	const { apiToken, supplierNameSearchField } = storeToRefs(store);

	console.log('InputFields.vue: store', apiToken.value, supplierNameSearchField.value);

	const emit = defineEmits(['update-output', 'update-results']);

	const token = ref(apiToken);

	const supplierName = ref(supplierNameSearchField);
	
	const results = ref([]);

	watch(token, newVal => {
		console.log('InputFields.vue: token changed to ' + newVal);
		store.setToken(newVal);
	});

	watch(supplierName, newVal => {
		console.log('InputFields.vue: supplierName changed to ' + newVal);
		store.setSupplierNameSearchField(newVal);
	});

	watch(results, newVal => {
		console.log('InputFields.vue: emitting update-results')
		emit('update-results', newVal);
	});

	const searchSuppliers = async () => {
		try {
			const res = await window.api.searchSuppliers(supplierName.value, token.value);

			console.log('InputFields.vue: got results', res);
			results.value = res;

			if (res.length > 0) {
				console.log('InputFields.vue: emitting results');
				emit('update-output', `${res.length} suppliers found`);
				emit('update-results', res);
			} else {
				emit('update-output', 'No suppliers found or error in response');
			}
		} catch (error) {
			console.log('InputFields.vue: error from rendere', error);	
		}
		
	};
</script>
