<template>
	<div id="input-fields" style="text-align: center; display: flex; flex-direction: column">
		<div style="display: flex; flex-direction: column">
			<label for="token">Token</label>
      <input type="text" name="token" id="token" v-model="token" placeholder="Enter your token" />
		</div>
		<div style="display: flex; flex-direction: column; margin-bottom: 14px">
			<label for="supplier">Supplier</label>
			<input type="text" name="supplier" id="supplier" v-model="supplier" value="Projacs Academy" placeholder="Enter your supplier name" />
		</div>
		<button id="submit" @click="searchSuppliers">Submit</button>
	</div>
</template>

<script setup>
  import { ref, watch, defineProps } from 'vue';
  const props = defineProps({
    token: String
  });

  const emit = defineEmits(['update-token', 'update-output', 'update-results']);
  
  const token = ref(props.token);
  const supplier = ref('');
  const results = ref([]);


  const updateInputs = async () => {
    console.log('getting inputs');
    const inputs = await window.api.loadInputs();
    if (inputs.token) {
      token.value = inputs.token;
    }
    if (inputs.supplier) {
      supplier.value = inputs.supplier;
    }

    window.api.receiveToken((token_value) => {
      console.log('Token received:', token_value);
      token.value = token_value;
    });
  };
  updateInputs();

  watch(token, (newVal) => {
    emit('update-token', newVal);
  });

  watch(supplier, (newVal) => {
    emit('update-supplier', newVal);
  });

  watch(results, (newVal) => {
    emit('update-results', newVal);
  });
  

	const searchSuppliers = async () => {
    
		const res = await window.api.searchSuppliers(supplier.value, token.value);
    console.log(res);
    this.results.value = res;

		if (res.length > 0) {
      emit('update-output', `${res.length} suppliers found`)
      emit('update-results', res)
			// You can add a method to update results here
		} else {
      emit('update-output', 'No suppliers found or error in response')
		}
	};
</script>

<style scoped>
	/* Add your styles here */
</style>
