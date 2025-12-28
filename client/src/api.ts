const API_URL = 'http://localhost:3001/api';

export const api = {
    getIncidents: async () => {
        const res = await fetch(`${API_URL}/incidents`);
        return res.json();
    },

    createIncident: async (title: string, description: string, serviceId: string) => {
        const res = await fetch(`${API_URL}/incidents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, serviceId })
        });
        return res.json();
    },

    updateIncidentStatus: async (id: string, status: string, assignedToId?: string) => {
        const res = await fetch(`${API_URL}/incidents/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, assignedToId })
        });
        return res.json();
    },

  getServices: async () => {
    const res = await fetch(`${API_URL}/services`);
    return res.json();
},

    escalateIncident: async (id: string) => {
        const res = await fetch(`${API_URL}/incidents/${id}/escalate`, { method: 'POST' });
        return res.json();
    },

        getOnCallServices: async () => {
            const res = await fetch(`${API_URL}/services/oncall`);
            return res.json();
        }
};
