
// select the form and buttons
const pinForm = document.querySelector('#pin-form')
const editButtons = document.querySelectorAll('.edit-button')
const deleteButtons = document.querySelectorAll('.delete-button')
const saveButton = document.querySelector('#save-button')
const cancelButton = document.querySelector('#cancel-button')
const formTitle = document.querySelector('#form-title')

// remember which pin is being edited
let editingId = null


// EDIT PIN =========================================================

// when the user clicks Edit, fill the form with the pin's information
editButtons.forEach(button => {
    button.addEventListener('click', () => {

        editingId = button.dataset.id

        document.querySelector('#imageUrl').value = button.dataset.image
        document.querySelector('#category').value = button.dataset.category
        document.querySelector('#itemName').value = button.dataset.name
        document.querySelector('#color').value = button.dataset.color
        document.querySelector('#tags').value = button.dataset.tags

        // change the form from Add Pin to Edit Pin
        formTitle.textContent = 'Edit Pin'
        saveButton.textContent = 'Update Pin'
        cancelButton.hidden = false

        // scroll back up to the form
        pinForm.scrollIntoView({ behavior: 'smooth' })
    })
})


// SAVE OR UPDATE PIN ================================================

// if we're editing, update the existing pin
// otherwise, let the form create a new pin as usual
pinForm.addEventListener('submit', event => {

    if (editingId === null) {
        return
    }

    // stop the normal POST form submission while editing
    event.preventDefault()

    const updatedPin = {
        imageUrl: document.querySelector('#imageUrl').value,
        category: document.querySelector('#category').value,
        itemName: document.querySelector('#itemName').value,
        color: document.querySelector('#color').value,
        tags: document.querySelector('#tags').value
    }

    fetch(`/pins/${editingId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPin)
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Could not update pin')
        }
        return res.json()
    })
    .then(() => window.location.reload())
    .catch(err => console.log(err))
})


// CANCEL EDIT =======================================================

cancelButton.addEventListener('click', () => {
    editingId = null

    pinForm.reset()
    formTitle.textContent = 'Add a Pin'
    saveButton.textContent = 'Save Pin'
    cancelButton.hidden = true
})


// DELETE PIN ========================================================

deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
        const id = button.dataset.id
        fetch(`/pins/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Could not delete pin')
            }
            return res.json()
        })
        .then(() => window.location.reload())
        .catch(err => console.log(err))
    })
})
