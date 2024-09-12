const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const PORT = 3000;

// Middleware pour analyser les données du formulaire
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Fonction pour convertir une chaîne base64 en fichier
function base64ToFile(base64Str, filePath) {
    // Supprimer les préfixes de type MIME
    const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(filePath, base64Data, 'base64');
}

// Route pour rendre la vidéo
app.post('/render', (req, res) => {
    console.log('Received request body:', req.body);

    const base64Image = req.body.image;
    const width = req.body.width;
    const height = req.body.height;

    if (!base64Image || !width || !height) {
        return res.status(400).send('Invalid data provided.');
    }

    console.log('Base64 Image (first 50 chars):', base64Image.substring(0, 50));
    console.log('Width:', width);
    console.log('Height:', height);

    const imagePath = 'temp-image.png';

    // Convertir base64 en fichier
    base64ToFile(base64Image, imagePath);

    // Commande FFmpeg avec redimensionnement et rotation
    const command = `
    ffmpeg -y -i ${imagePath} -vf "scale=${width}:${height}, rotate=PI/2*t:ow=rotw(PI/2*t):oh=roth(PI/2*t), fps=30" -t 5 -pix_fmt yuv420p output.mp4`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            console.error(`FFmpeg stderr: ${stderr}`);
            return res.status(500).send('Rendering failed.');
        }

        res.download('output.mp4', () => {
            fs.unlinkSync(imagePath); // Supprimer l'image temporaire après rendu
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
