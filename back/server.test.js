const request = require('supertest');
const app = require('./server');

describe('Bot War Server', () => {
    beforeEach(() => {
        app._resetState();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('GET /', () => {
        it('should return welcome message', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.text).toBe('Bienvenue sur le serveur de Bot War');
        });
    });

    describe('POST /set-decision', () => {
        it('should accept valid decision', async () => {
            const decision = { move: 'UP', action: 'COLLECT' };

            const response = await request(app)
                .post('/set-decision')
                .send(decision)
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                decision: decision
            });
        });

        it('should reject invalid move', async () => {
            const response = await request(app)
                .post('/set-decision')
                .send({ move: 'INVALID', action: 'NONE' })
                .expect(400);

            expect(response.body.error).toBe('Mouvement invalide');
        });

        it('should reject invalid action', async () => {
            const response = await request(app)
                .post('/set-decision')
                .send({ move: 'STAY', action: 'INVALID' })
                .expect(400);

            expect(response.body.error).toBe('Action invalide');
        });
    });

    describe('GET /get-decision', () => {
        it('should return current state', async () => {
            const response = await request(app)
                .get('/get-decision')
                .expect(200);

            expect(response.body).toEqual({
                manualDecision: null,
                lastUsedDecision: { move: 'STAY', action: 'NONE' }
            });
        });
    });

    describe('GET /action', () => {
        it('should return default decision', async () => {
            const response = await request(app)
                .get('/action')
                .expect(200);

            expect(response.body).toEqual({
                move: 'STAY',
                action: 'NONE'
            });
        });

        it('should return and consume manual decision', async () => {
            const decision = { move: 'RIGHT', action: 'BOMB' };

            await request(app)
                .post('/set-decision')
                .send(decision);

            const response = await request(app)
                .get('/action')
                .expect(200);

            expect(response.body).toEqual(decision);
        });
    });

    describe('Workflow', () => {
        it('should handle complete workflow', async () => {
            // Set decision
            const decision = { move: 'UP', action: 'COLLECT' };
            await request(app)
                .post('/set-decision')
                .send(decision)
                .expect(200);

            // Get decision
            const response = await request(app)
                .get('/action')
                .expect(200);

            expect(response.body).toEqual(decision);
        });
    });
}); 