const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`


const submitButton = document.getElementById('submit')



submitButton.onclick = async (e) => {
  // prevent default behavior of the button
  e.preventDefault()
  const token = document.getElementById('token')

  // get supplier name
  const supplierName = document.getElementById('company-name');

  const params = {
    token: token.value,
    keyword: supplierName.value
  }

  const response = await api.searchSuppliers(params)
  console.log(response)
  //console.log(token.value, supplierName.value)
}

const func = async () => {
    const response = await window.versions.ping()
    console.log(response) // prints out 'pong'
  }
  
  func()
  
  