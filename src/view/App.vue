<script setup lang="ts">
	import { ref } from 'vue';
	import LoginButton from './components/LoginButton.vue';
	import InputFields from './components/InputFields.vue';
	import ResultsTable from './components/ResultsTable.vue';
	import SupplierInfo from './components/SupplierInfo.vue';

	const token = ref('');
	const output = ref('');
	const results = ref([]);
	const supplier = ref(null);

	const updateOutput = (newVal)=>{
		console.log('output received an update');
		output.value = newVal;
	}

	const updateSupplier = (newVal) => {
		console.log('supplier received an update');
		supplier.value = newVal;
	}

	const updateResults = (newVal) => {
		console.log('results received an update');
		results.value = newVal;
		console.log('results:', results.value);
	}

	const updateToken = (newVal) => {
		console.log('token received an update'); 
		token.value = newVal;
	}
</script>

<template>
	<div id="app">
		<h1>Supprover!</h1>
		<p>Welcome to your Electron application.</p>
		<LoginButton />
		<InputFields @update-results="updateResults" @update-supplier="updateSupplier" @update-output="updateOutput" @update-token="updateToken" :token="token" />
		<hr />
		<h2>Output</h2>
		<div id="output">{{ output }}</div>
		<ResultsTable @update-results="updateResults" :token="token" :results="results" />
		<SupplierInfo @update-suppier="updateSupplier" :token="token" :supplier="supplier" />
	</div>
</template>
