<script setup lang="ts">
	import { ref } from 'vue';
	import LoginButton from './components/LoginButton.vue';
	import InputFields from './components/InputFields.vue';
	import ResultsTable from './components/ResultsTable.vue';
	import SupplierInfo from './components/SupplierInfo.vue';

	const output = ref('');
	const results = ref([]);
	const supplier = ref(null);
</script>

<template>
	<div id="app">
		<h1>Supprover!</h1>
		<p>Welcome to your Electron application.</p>
		<LoginButton />
		<InputFields />
		<hr />
		<h2>Output</h2>
		<div id="output">{{ output }}</div>
		<ResultsTable :results="results" />
		<SupplierInfo :supplier="supplier" />
	</div>
</template>
