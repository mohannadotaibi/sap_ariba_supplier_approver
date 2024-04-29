import './index.css';

const submitButton = document.getElementById('submit') as HTMLButtonElement;
const supplier = document.getElementById('supplier') as HTMLInputElement;
const output = document.getElementById('output') as HTMLDivElement;

submitButton.addEventListener('click', () => {
  output.innerText = supplier.value;
  // pass the supplier.value to the exposed function in preload.ts
  // the below line says printToken is not available in window
    // window.printToken.searchSuppliers(supplier.value);
    // the below line works
    // @ts-ignore-next-line
    api.searchSuppliers(supplier.value);
});

console.log('👋 This message is being logged by "renderer.ts", included via Vite');
