const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Variable pour stocker la décision manuelle du frontend
let manualDecision = null;
let lastDecision = { move: 'STAY', action: 'NONE' };

app.get('/', (req, res) => {
    res.send('Bienvenue sur le serveur de Bot War');
});

app.get('/visualizer', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'front', 'index.html'));
});

// Nouvel endpoint pour recevoir les décisions du frontend
app.post('/set-decision', (req, res) => {
    const { move, action, bombType } = req.body;
    
    // Validation basique
    const validMoves = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'STAY'];
    const validActions = ['COLLECT', 'ATTACK', 'BOMB', 'NONE'];
    const validBombTypes = ['proximity', 'timer', 'static'];
    
    if (!validMoves.includes(move)) {
        return res.status(400).json({ error: 'Mouvement invalide' });
    }
    
    if (!validActions.includes(action)) {
        return res.status(400).json({ error: 'Action invalide' });
    }
    
    if (action === 'BOMB' && bombType && !validBombTypes.includes(bombType)) {
        return res.status(400).json({ error: 'Type de bombe invalide' });
    }
    
    // Stocker la décision manuelle
    manualDecision = { move, action };
    if (action === 'BOMB' && bombType) {
        manualDecision.bombType = bombType;
    }
    
    console.log('Nouvelle décision manuelle reçue:', manualDecision);
    res.json({ success: true, decision: manualDecision });
});

// Endpoint pour récupérer la décision actuelle stockée
app.get('/get-decision', (req, res) => {
    res.json({ 
        manualDecision, 
        lastUsedDecision: lastDecision 
    });
});

app.get('/action', (req, res) => {
    // Si une décision manuelle est disponible, l'utiliser
    if (manualDecision) {
        lastDecision = manualDecision;
        const decisionToSend = { ...manualDecision };
        
        // Réinitialiser la décision manuelle après utilisation
        manualDecision = null;
        
        console.log('Envoi de la décision manuelle:', decisionToSend);
        res.json(decisionToSend);
        return;
    }
    
    // Sinon, retourner la dernière décision connue ou une décision par défaut
    console.log('Aucune décision manuelle, retour de la dernière décision:', lastDecision);
    res.json(lastDecision);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Bot War - Contrôleur Manuel');
    console.log('Interface de contrôle disponible sur: http://localhost:3000/visualizer');
});