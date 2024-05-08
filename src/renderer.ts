import './index.css';

const submitButton = document.getElementById('submit') as HTMLButtonElement;
const supplier = document.getElementById('supplier') as HTMLInputElement;
const output = document.getElementById('output') as HTMLDivElement;
const token = document.getElementById('token') as HTMLInputElement;

submitButton.addEventListener('click', async () => {
  output.innerText = supplier.value;
  // @ts-expect-error
    const res =  api.searchSuppliers(supplier.value, token.value);
    console.log('res', res)
});

console.log('👋 This message is being logged by "renderer.ts", included via Vite');
