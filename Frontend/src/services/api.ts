import { User, LeaderboardEntry, ActivePlayer } from '../lib/mockBackend';
// Note: We are reusing types from mockBackend for now to avoid refactoring everything, 
// but we should eventually move types to a shared location or generated file.
// Ideally, we would generate these from OpenAPI, but for this task we'll match manually.

const API_Base_URL = '';

export const api = {
    // Auth
    async signup(email: string, password: string, username: string) {
        const res = await fetch(`${API_Base_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, username }),
        });
        if (!res.ok) {
            const error = await res.json();
            return { user: null, error: error.detail || 'Signup failed' };
        }
        const data = await res.json();
        localStorage.setItem('token', data.token);
        return { user: data.user, error: null };
    },

    async login(email: string, password: string) {
        const res = await fetch(`${API_Base_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const error = await res.json();
            return { user: null, error: error.detail || 'Login failed' };
        }
        const data = await res.json();
        localStorage.setItem('token', data.token);
        return { user: data.user, error: null };
    },

    async logout() {
        const token = localStorage.getItem('token');
        if (token) {
            await fetch(`${API_Base_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            localStorage.removeItem('token');
        }
    },

    async getCurrentUser() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const res = await fetch(`${API_Base_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            localStorage.removeItem('token');
            return null;
        }
        return await res.json();
    },

    // Leaderboard
    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        const res = await fetch(`${API_Base_URL}/leaderboard`);
        if (!res.ok) return [];
        return await res.json();
    },

    async submitScore(score: number, mode: string) {
        const token = localStorage.getItem('token');
        if (!token) return; // Must be logged in

        await fetch(`${API_Base_URL}/leaderboard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ score, mode })
        });
    },

    // Spectate
    async getActivePlayers(): Promise<ActivePlayer[]> {
        const res = await fetch(`${API_Base_URL}/players/active`);
        if (!res.ok) return [];
        return await res.json();
    },

    watchPlayer(playerId: string): AsyncGenerator<any, void, unknown> {
        // SSE Implementation
        const eventSource = new EventSource(`${API_Base_URL}/players/${playerId}/watch`);

        // Create a generator that yields events
        // This is a bit tricky with EventSource which is callback based, 
        // so we'll use a push/pull mechanism or a simple async iterator wrapper.
        // For simplicity in this React usage, we might return the EventSource itself 
        // or wrap it. But `mockBackend` returned a generator. 
        // Let's implement an async generator wrapper around the EventSource.

        let resolve: Function;
        let promise = new Promise(r => resolve = r);
        const queue: any[] = [];
        let closed = false;

        eventSource.onmessage = (e) => {
            queue.push(JSON.parse(e.data));
            resolve();
        };

        eventSource.onerror = () => {
            closed = true;
            eventSource.close();
            resolve();
        };

        async function* generator() {
            while (!closed) {
                if (queue.length > 0) {
                    yield queue.shift();
                } else {
                    await promise;
                    promise = new Promise(r => resolve = r);
                }
            }
        }

        // Better yet, for React useEffect usage in Watch.tsx, it might be easier to change Watch.tsx 
        // to handle EventSource directly, but let's try to match the interface if possible.
        // However, the generator pattern in JS for SSE is not native.
        // Let's modify Watch.tsx to accept an EventSource or similar if we can, 
        // BUT for now, let's just make `watchPlayer` return the EventSource URL 
        // or handle it inside the component. The mock was a generator.
        // I will rewrite Watch.tsx logic later to be more robust with SSE.
        // For the API service, I'll expose a URL getter or `createEventSource` method.

        return generator();
    },

    getWatchURL(playerId: string) {
        return `${API_Base_URL}/players/${playerId}/watch`;
    }
};
