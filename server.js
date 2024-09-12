const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware pour analyser les données du formulaire
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Configuration multer pour sauvegarder l'image uploadée temporairement
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// Route pour rendre la vidéo
app.post('/render', upload.single('image'), (req, res) => {
    console.log('Received request body:', req.body);

    const imageFile = req.file;
    const width = req.body.width;
    const height = req.body.height;

    if (!imageFile || !width || !height) {
        return res.status(400).send('Invalid data provided.');
    }

    console.log('Image path:', imageFile.path);
    console.log('Width:', width);
    console.log('Height:', height);

    // Commande FFmpeg avec redimensionnement et rotation
    const command = `
    ffmpeg -y -i ${imageFile.path} -vf "scale=${width}:${height}, rotate=PI/2*t:ow=rotw(PI/2*t):oh=roth(PI/2*t), fps=30" -t 5 -pix_fmt yuv420p output.mp4`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            console.error(`FFmpeg stderr: ${stderr}`);
            return res.status(500).send('Rendering failed.');
        }

        res.download('output.mp4', () => {
            fs.unlinkSync(imageFile.path); // Supprimer l'image temporaire après rendu
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
