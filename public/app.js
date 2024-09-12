// Sélection des éléments du DOM
const imageUpload = document.getElementById('imageUpload');
const previewDiv = document.getElementById('preview');
const widthSlider = document.getElementById('widthSlider');
const heightSlider = document.getElementById('heightSlider');
let uploadedFile;

// Fonction pour charger et afficher l'image
imageUpload.addEventListener('change', function () {
    const file = this.files[0];
    uploadedFile = file;

    if (file) {
        const reader = new FileReader();
        
        reader.onload = function (e) {
            previewDiv.innerHTML = `<img id="animatedImage" src="${e.target.result}" alt="Selected Image">`;
            updateImageSize();  // Mettre à jour la taille en fonction des sliders
        };
        
        reader.readAsDataURL(file);
    }
});

// Fonction pour mettre à jour la taille de l'image en fonction des sliders
function updateImageSize() {
    const image = document.getElementById('animatedImage');
    if (image) {
        image.style.width = `${widthSlider.value}px`;
        image.style.height = `${heightSlider.value}px`;
    }
}

// Écouteurs pour les sliders
widthSlider.addEventListener('input', updateImageSize);
heightSlider.addEventListener('input', updateImageSize);

// Bouton pour rendre la vidéo avec l'image et la taille choisie
document.getElementById('renderBtn').addEventListener('click', function () {
    if (!uploadedFile) {
        alert('Please upload an image before rendering.');
        return;
    }

    const formData = new FormData();
    formData.append('image', uploadedFile); // Ajouter le fichier image
    formData.append('width', widthSlider.value);
    formData.append('height', heightSlider.value);

    // Afficher les données pour le débogage
    console.log('Sending form data:');
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    fetch('/render', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'animated-image.mp4';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error during rendering:', error);
    });
});
