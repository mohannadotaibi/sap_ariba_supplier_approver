import './index.css';

const submitButton = document.getElementById('submit') as HTMLButtonElement;
const supplier = document.getElementById('supplier') as HTMLInputElement;
const output = document.getElementById('output') as HTMLDivElement;
const token = document.getElementById('token') as HTMLInputElement;
const results_table = document.getElementById('results-table') as HTMLTableElement;

submitButton.addEventListener('click', async () => {
    // @ts-expect-error it exists
    const res =  await api.searchSuppliers(supplier.value, token.value);
    
    
    if(res.statusCode == 0 && res.suppliers.length > 0){
        results_table.innerHTML = '';  // Clear previous results
        const list = document.createElement('ul');

        res.suppliers.forEach((supplier:any) => {
            console.log('supplier', supplier)
            const li = document.createElement('li');
            li.innerHTML = `<strong>${supplier.name}</strong> - Vendor ID: ${supplier.smVendorId}`;

            // Example link to a profile page (if such a page exists)
            // You'd need to replace `profileUrl` with an actual URL based on your system
            const profileUrl = `https://example.com/profile/${supplier.smVendorId}`;
            li.innerHTML += ` <a href="${profileUrl}" target="_blank">Profile</a>`;

            // Assuming an 'Approve' action might need to be taken
            if (supplier.creationStatus === "Pending Approval") {
                const approveButton = document.createElement('button');
                approveButton.textContent = 'Approve';
                approveButton.onclick = () => {
                    //handleApproval(supplier.smVendorId, token.value); // Example function
                };
                li.appendChild(approveButton);
            }

            list.appendChild(li);
        });
        results_table.appendChild(list);


        output.innerText = `${res.suppliers.length} suppliers found`;
        console.log('status code from rendere', res.statusCode)
    }
    else{
        output.innerText = 'No suppliers found or error in response';
    }
});

console.log('👋 This message is being logged by "renderer.ts", included via Vite');



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

