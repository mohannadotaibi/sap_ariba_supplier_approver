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
		supplier.value = newVal[0];
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
	<div id="app" class="bg-slate-950 text-white h-screen">
		<div class="container mx-auto">
			<h1 class="text-3xl font-medium mb-5 leading-loose">Supprover!</h1>
			<p class="text-emerald-400">Welcome to SAP Ariba Supplier Approver. Click the login button below to get started.</p>
			<LoginButton />

			<InputFields @update-results="updateResults" @update-output="updateOutput" />

			<hr />
			<h2>Output</h2>
			<div id="output">{{ output }}</div>

			<ResultsTable :results="results" />

			<SupplierDetails :supplier="results" />
		</div>
		
	</div>
</template>