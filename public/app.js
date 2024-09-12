// Sélection des éléments du DOM
const imageUpload = document.getElementById('imageUpload');
const previewDiv = document.getElementById('preview');
const widthSlider = document.getElementById('widthSlider');
const heightSlider = document.getElementById('heightSlider');
let base64Image;

// Fonction pour charger et afficher l'image
imageUpload.addEventListener('change', function () {
    const file = this.files[0];
    const reader = new FileReader();
    
    reader.onload = function (e) {
        base64Image = e.target.result; // Convertir l'image en base64
        previewDiv.innerHTML = `<img id="animatedImage" src="${base64Image}" alt="Selected Image">`;
        updateImageSize();  // Mettre à jour la taille en fonction des sliders
    };
    
    if (file) {
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

// Bouton pour lancer la prévisualisation de l'animation
document.getElementById('previewBtn').addEventListener('click', function () {
    const image = document.getElementById('animatedImage');
    if (image) {
        image.classList.remove('rotate-bounce'); // Réinitialise l'animation
        void image.offsetWidth; // Force un reflow pour que l'animation redémarre
        image.classList.add('rotate-bounce'); // Ajoute l'animation
    }
});

// Bouton pour rendre la vidéo avec l'image et la taille choisie
document.getElementById('renderBtn').addEventListener('click', function () {
    if (!base64Image) {
        alert('Please upload an image before rendering.');
        return;
    }

    const formData = new FormData();
    formData.append('image', base64Image); // Ajouter l'image en base64
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
