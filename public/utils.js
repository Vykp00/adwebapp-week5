if (document.readyState !== "loading") {
    console.log("Document loaded");
    inittializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        console.log("Document is ready after loading");
        inittializeCode();
    });
}
//Function to fetch and display the Pizza recipe from week 4
/*
async function fetchRecipe () {
    // Fetch the recipe from the server
    fetch('/recipe/pizza')
        .then(response => response.json())
        .then(recipe => {
            // Display the recipe details on the page
            document.getElementById('recipe-container').innerHTML = `
                    <h2>${recipe.name}</h2>
                    <h3>Instructions:</h3>
                    <ul>
                        ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                    </ul>
                    <h3>Ingredients:</h3>
                    <ul>
                        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                `;
        })
        .catch(error => console.error('Error fetching recipe:', error));
}
*/

function inittializeCode() {
    // Create formData to submit recipe 
    //const formData = new FormData();

    // Create ingredients and isnstruction wait list
    const ingredientForm = [];
    const instructionForm = [];

    // Add ingredient to wait list
    const addIngredient = document.querySelector('#add-ingredient');
    addIngredient.addEventListener('click', async () => {
        const ingredient = document.getElementById('ingredients-text');
        ingredientForm.push(ingredient.value);
        console.log(ingredientForm);
        console.log(`${ingredient.value} added`);
    });

    // Add instruction to wait list
    const addInstruction = document.querySelector('#add-instruction');
    addInstruction.addEventListener('click', async () => {
        const instruction = document.getElementById('instructions-text');
        instructionForm.push(instruction.value);
        console.log(instructionForm);
        console.log(`${instruction.value} added`);
    });

    // Add selected category to waitlist
    // Get Category from Special Diets text
    const categoriesContainer = document.getElementById('categories-container');
    // Fetch and display special diet from database
    fetch('/categories')
        .then(response => response.json())
        .then(categories => {
            categories.forEach(category => {
                // Create value with category name based on Materialize
                const label = document.createElement('label');
                label.htmlFor = category._id;

                // Create check box for each category and add value as category._id for to submit with recipe data
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = category._id;
                checkbox.value = category._id;

                // Create span to show category name
                const span = document.createElement('span')
                span.appendChild(document.createTextNode(category.name));

                label.appendChild(checkbox);
                label.appendChild(span);

                const br = document.createElement('br');

                categoriesContainer.appendChild(label);
                categoriesContainer.appendChild(br);
            });
        })
        .catch(error => console.error('Error fetching categories', error));

        /*
    // add images to FormData when it's uploaded
    const addImg = document.getElementById('image-input');
    addImg.addEventListener('change', async () => {
        console.log(addImg.files.length);
        for (var i = 0; i < addImg.files.length; i++) {
            formData.append('images', addImg.files[i]);
        };
        console.log(...formData);
        console.log("Image added");
    });
    */


    // Handle POST request to /recipe/ and image
    const submitBtn = document.querySelector('#submit');
    submitBtn.addEventListener('click', () => {
        //Handle POST recipe
        const name = document.getElementById('name-text');
        const newRecipe = {
            name: name.value,
            ingredients: ingredientForm,
            instructions: instructionForm,
            categories: getSelectedCategories(),
            // Add the selected images to the recipes later
            // I tried includes images seperately
        };

        console.log(newRecipe);
        fetch('/recipe/', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(newRecipe),
        })
            .then(response => response.json())
            .then(recipe => {
                console.log('New recipe added:', recipe);

                // Now, handle the image upload separately
                const imageFormData = new FormData();
                getSelectedImages().forEach(image => {
                    imageFormData.append('images', image);
                });

                //Handle POST request for images
                fetch(`/recipe/${recipe._id}/images`, {
                    method: 'POST',
                    body: imageFormData,
                })
                .then((res) => {
                    console.log('Images uploaded successfully:', res);
                })
                .catch(error => console.error('Error adding new images:', error));
            })
            .catch(error => console.error('Error adding new recipe:', error));
    });

    // Get Search Form to search for recipe and images
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const searchInput = document.getElementById('search-input').value;

        // Fetch the recipe based on the search input
        await fetch(`/recipe/${searchInput}`)
            .then(response => response.json())
            .then(recipe => {
                // Display the recipe details on the page
                document.getElementById('recipe-container').innerHTML = `
                    <h2>${recipe.name}</h2>
                    <h3>Instructions:</h3>
                    <ul>
                        ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                    </ul>
                    <h3>Ingredients:</h3>
                    <ul>
                        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                `;
                // Fetch and display images related to the recipe
                fetchAndDisplayImages(recipe.images);
            })
            .catch(error => console.error('Error fetching recipe:', error));
    });

}
async function fetchAndDisplayImages(imageIds) {
    const imagesContainer = document.getElementById('images');

    // Loop through the image IDs and fetch each image
    for (const imageId of imageIds) {
        try {
            const response = await fetch(`/images/${imageId}`);

            // Create an img element and set the source to the fetched image
            const imgElement = document.createElement('img');
            imgElement.src = URL.createObjectURL(await response.blob());

            // Append the image to the images container
            imagesContainer.appendChild(imgElement);
        } catch (error) {
            console.error('Error fetching image: ', error);
        }
    }
}
// Get imageslist from input
function getSelectedImages() {
    const selectedImages = [];
    const imageInputs = document.querySelectorAll('input[type="file"]');
    imageInputs.forEach(input => {
        for (let i = 0; i < input.files.length; i++) {
            selectedImages.push(input.files[i]);
        }
    });
    return selectedImages;
}

// Get checked categories for recipe form
function getSelectedCategories() {
    const selectedCategories = [];
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedCategories.push(checkbox.value);
        }
    });
    return selectedCategories;
}