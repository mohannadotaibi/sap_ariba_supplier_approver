<script setup lang="ts">
	import { ref, watch } from 'vue';
	import LoginButton from './components/LoginButton.vue';
	import InputFields from './components/InputFields.vue';
	import ResultsTable from './components/ResultsTable.vue';
	import SupplierDetails from './components/SupplierDetails.vue';

	import {useStore} from '../store/main';

	const store = useStore();

	const output = ref('');
	const results = ref([]);
	const supplier = ref(null);

	const updateOutput = newVal => {
		console.log('output received an update');
		output.value = newVal;
	};

	const updateResults = newVal => {
		console.log('results received an update');
		console.log(newVal)
		results.value = newVal;
		updateSupplier(supplier)
		//supplier.value = newVal[0];
	};

	const updateSupplier = newVal => {
		console.log('supplier received an update');
		supplier.value = newVal;
	};
	 
	window.api.receiveToken((token_value: string) => {
		console.log('Token received From Login Window:', token_value);
		console.log('saving to local storage');
		store.setToken(token_value);
	});


</script>

<template>
	<div id="app" class="bg-slate-950 text-white min-h-screen p-2">
		<div class="container mx-auto">
			<header class="flex justify-between mb-5">
				<h1 class="text-3xl font-medium">Supprover!</h1>
				<LoginButton />
			</header>
			
			<p class="text-emerald-400">Welcome to SAP Ariba Supplier Approver. Click the login button below to get started.</p>
			<InputFields @update-results="updateResults" @update-output="updateOutput" />

			<hr class="py-4" />
			<h2 class="font-bold text-2xl">Output</h2>
			<div id="output">{{ output }}</div>

			<ResultsTable :results="results" />

			<SupplierDetails :supplier="results" />
		</div>
		
	</div>
</template>