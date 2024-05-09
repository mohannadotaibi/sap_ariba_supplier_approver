import './index.css';

const submitButton = document.getElementById('submit') as HTMLButtonElement;
const supplier = document.getElementById('supplier') as HTMLInputElement;
const output = document.getElementById('output') as HTMLDivElement;
const token = document.getElementById('token') as HTMLInputElement;

submitButton.addEventListener('click', async () => {
    // @ts-expect-error
    const res =  await api.searchSuppliers(supplier.value, token.value);
    console.log('res', res)

    if(res.statusCode == 0){
        output.innerText = `${res.suppliers.length} suppliers found`;
        console.log('status code from rendere', res.statusCode)
    }
    else{
        output.innerText = 'Error';
    }
});

console.log('👋 This message is being logged by "renderer.ts", included via Vite');
