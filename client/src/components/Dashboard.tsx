import React, { useEffect, useState } from 'react';
import { api } from '../api';

interface Incident {
    id: string;
    title: string;
    description: string;
    status: string;
    service: { name: string };
    assignedTo: { name: string } | null;
    createdAt: string;
}

interface Service {
    id: string;
    name: string;
}

export const Dashboard: React.FC = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    // New Incident Form
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [serviceId, setServiceId] = useState('');

    const fetchData = async () => {
        try {
            const [inc, serv] = await Promise.all([
                api.getIncidents(),
                api.getServices()
            ]);
            setIncidents(inc);
            setServices(serv);
            if (serv.length > 0 && !serviceId) setServiceId(serv[0].id);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll for updates
        return () => clearInterval(interval);
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serviceId) return;
        await api.createIncident(title, desc, serviceId);
        setTitle('');
        setDesc('');
        fetchData();
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        await api.updateIncidentStatus(id, newStatus);
        fetchData();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Incident Command</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>On-Call Management System</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {/* We can fetch this dynamic list effectively later, for MVP assuming single rotation or just showing "Primary" */}
                    <div className="badge" style={{ background: '#333' }}>Primary On-Call: Alice DevOps (Level 1)</div>
                </div>
            </header>

            <div className="grid">
                {/* Trigger Incident Card */}
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <h2>Trigger Incident</h2>
                    <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label>Title</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. API High Latency" />
                        </div>
                        <div style={{ flex: 2 }}>
                            <label>Description</label>
                            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Details..." />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Service</label>
                            <select value={serviceId} onChange={e => setServiceId(e.target.value)}>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <button className="btn" type="submit">Trigger Alert</button>
                    </form>
                </div>

                {/* Incident List */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <h3>Active Incidents</h3>
                    {incidents.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No active incidents.</p> : null}

                    <div className="grid">
                        {incidents.map(inc => (
                            <div key={inc.id} className="card" style={{ borderLeft: `4px solid ${inc.status === 'TRIGGERED' ? 'var(--danger)' : inc.status === 'ACKNOWLEDGED' ? 'var(--warning)' : 'var(--success)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span className={`badge status-${inc.status}`}>{inc.status}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {new Date(inc.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                <h3 style={{ marginBottom: '0.5rem' }}>{inc.title}</h3>
                                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>{inc.description}</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        <div style={{ fontWeight: 'bold' }}>{inc.service.name}</div>
                                        <div style={{ color: 'var(--text-secondary)' }}>
                                            Responder: {inc.assignedTo?.name || 'Unassigned'}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {inc.status === 'TRIGGERED' && (
                                            <button className="btn" onClick={() => handleStatusChange(inc.id, 'ACKNOWLEDGED')}>Acknowledge</button>
                                        )}
                                        {inc.status !== 'RESOLVED' && (
                                            <>
                                                <button className="btn btn-secondary" onClick={() => handleStatusChange(inc.id, 'RESOLVED')}>Resolve</button>
                                                <button className="btn btn-secondary" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={async () => {
                                                    await api.escalateIncident(inc.id);
                                                    fetchData();
                                                }}>Escalate</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
