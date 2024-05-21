import './view/style.css';
//import { createApp } from 'vue'
//import App from './view/App.vue'

//const app = createApp(App)
//app.mount('#app')


const submitButton = document.getElementById('submit') as HTMLButtonElement;
const supplier = document.getElementById('supplier') as HTMLInputElement;
const output = document.getElementById('output') as HTMLDivElement;
const token = document.getElementById('token') as HTMLInputElement;
const results_table = document.getElementById('results-table') as HTMLTableElement;

submitButton.addEventListener('click', async () => {
    output.innerText = 'searching';
    results_table.innerHTML = '';  // Clear previous results
    // @ts-expect-error it exists
    const res =  await api.searchSuppliers(supplier.value, token.value);
    console.log('res', res) 
    
    if(res.suppliers.statusCode == 0 && res.suppliers.suppliers.length > 0){
        results_table.innerHTML = '';  // Clear previous results
        const list = document.createElement('ul');

        for(const supplier of res.suppliers.suppliers){
            console.log('supplier', supplier)
            const li = document.createElement('li');
            li.innerHTML = `<strong>${supplier.name}</strong> - Vendor ID: ${supplier.smVendorId}`;

            const profileUrl = `https://example.com/profile/${supplier.smVendorId}`;
            li.innerHTML += ` <a href="${profileUrl}" target="_blank">Profile</a>`;

            // Assuming an 'Approve' action might need to be taken
            // eslint-disable-next-line no-constant-condition
            if (res.vendor.vendor.vendorInfo.registrationStatus === "PendingApproval") {
                const approveButton = document.createElement('button');
                approveButton.textContent = 'Approve';
                approveButton.onclick = async () => {
                    console.log
                    await handleApproval(res.registrationTaskId, token.value);
                    alert('approved')
                };
                li.appendChild(approveButton);
            }

            list.appendChild(li);
        }


        results_table.appendChild(list);

        output.innerText = `${res.suppliers.suppliers.length} suppliers found`;
        console.log('status code from rendere', res.statusCode)
    }
    else{
        output.innerText = 'No suppliers found or error in response';
    }
});

async function handleApproval(taskId: string, token: string) {
    console.log('Approving task renderer.ts', taskId);
    // @ts-expect-error it exists
    api.approveVendor(taskId, token).then((res) => {
        if (res.statusCode === 0) {
            console.log('Vendor data:', res);
            // Do something with the vendor data
        } else {
            console.error('Error:', res.message);
        }
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    // @ts-expect-error it exists
    const inputs = await api.loadInputs();
    if (inputs.token) {
        token.value = inputs.token;
    }
    if (inputs.supplier) {
        supplier.value = inputs.supplier; 
    }
}); // what

window.addEventListener('beforeunload', async () => {
    const inputs = {
        token: token.value,
        supplier: supplier.value,
    };
    // @ts-expect-error it exists
    await api.saveInputs(inputs);
});

