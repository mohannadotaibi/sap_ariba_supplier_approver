<script setup lang="ts">
	import { ref, watch } from 'vue';
	import LoginButton from './components/LoginButton.vue';
	import InputFields from './components/InputFields.vue';
	import ResultsTable from './components/ResultsTable.vue';
	import SupplierInfo from './components/SupplierInfo.vue';

	const token = ref('');
	const output = ref('');
	const results = ref([]);
	const supplier = ref(null);

	const updateToken = newVal => {
		console.log('token received an update');
		token.value = newVal;
		saveInputs(); // Save the updated token
	};

	// Function to save inputs to storage
	const saveInputs = async () => {
		const inputs = {
			token: token.value,
			supplier: supplier.value
		};
		await window.api.saveInputs(inputs);
	};

	const updateOutput = newVal => {
		console.log('output received an update');
		output.value = newVal;
	};

	const updateSupplierName = newVal => {
		console.log('supplier received an update');
		//supplier.value = newVal;
	};

	const updateResults = newVal => {
		console.log('results received an update');
		console.log(newVal)
		results.value = newVal;
	};
	
	// Load inputs from storage on component mount
	const loadInputs = async () => {
		const inputs = await window.api.loadInputs();
		if (inputs.token) {
			token.value = inputs.token;
		}
		if (inputs.supplier) {
			supplier.value = inputs.supplier;
		}
	};
	// Call loadInputs and receiveToken on component mount
	loadInputs();
 
	window.api.receiveToken((token_value: string) => {
		console.log('Token received:', token_value);
		token.value = token_value;
	});

	watch(token, saveInputs);

</script>

<template>
	<div id="app">
		<h1>Supprover!</h1>
		<p>Welcome to your Electron application.</p>
		<LoginButton />

		<InputFields 
		@update-results="updateResults" 
		@update-supplier-name="updateSupplierName" 
		@update-output="updateOutput" 
		@update-token="updateToken" 
		:token="token" />

		<hr />
		<h2>Output</h2>
		<div id="output">{{ output }}</div>

		<ResultsTable 
		:token="token" 
		:results="results" />

		<!--<SupplierInfo 
		:token="token" 
		:supplier="results[0].supplier" />-->
	</div>
</template>
