const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

let manualDecision = null;
let lastDecision = { move: 'STAY', action: 'NONE' };

app.get('/', (req, res) => {
    res.send('Bienvenue sur le serveur de Bot War');
});

app.post('/set-decision', (req, res) => {
    const { move, action } = req.body;
    
    const validMoves = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'STAY'];
    const validActions = ['COLLECT', 'ATTACK', 'BOMB', 'NONE'];
    
    if (!validMoves.includes(move)) {
        return res.status(400).json({ error: 'Mouvement invalide' });
    }
    
    if (!validActions.includes(action)) {
        return res.status(400).json({ error: 'Action invalide' });
    }
    
    manualDecision = { move, action };
    
    console.log('Nouvelle décision manuelle reçue:', manualDecision);
    res.json({ success: true, decision: manualDecision });
});

app.get('/get-decision', (req, res) => {
    res.json({ 
        manualDecision, 
        lastUsedDecision: lastDecision 
    });
});

app.get('/action', (req, res) => {
    if (manualDecision) {
        lastDecision = manualDecision;
        const decisionToSend = { ...manualDecision };
        
        manualDecision = null;
        
        console.log('Envoi de la décision manuelle:', decisionToSend);
        res.json(decisionToSend);
        return;
    }
    
    console.log('Aucune décision manuelle, retour de la dernière décision:', lastDecision);
    res.json(lastDecision);
});

// Export the app and test utilities
app._resetState = () => {
    manualDecision = null;
    lastDecision = { move: 'STAY', action: 'NONE' };
};

app._getState = () => ({
    manualDecision,
    lastDecision
});

module.exports = app;

// Start server only if this file is run directly
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log('Bot War - Contrôleur Manuel');
        console.log('Interface de contrôle disponible sur: http://localhost:3000/visualizer');
    });
}