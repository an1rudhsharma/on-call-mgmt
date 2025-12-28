import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// --- Services ---

router.get('/services', async (req, res) => {
    const services = await prisma.service.findMany({
        include: { policy: true }
    });
    res.json(services);
});

router.post('/services', async (req, res) => {
    const { name, policyId } = req.body;
    const service = await prisma.service.create({
        data: { name, policyId }
    });
    res.json(service);
});

// --- Escalation Policies ---

router.get('/policies', async (req, res) => {
    const policies = await prisma.escalationPolicy.findMany({
        include: { steps: { include: { user: true } } }
    });
    res.json(policies);
});

router.post('/policies', async (req, res) => {
    const { name, steps } = req.body; // steps: [{ userId, delayUsers, order }]
    const policy = await prisma.escalationPolicy.create({
        data: {
            name,
            steps: {
                create: steps
            }
        }
    });
    res.json(policy);
});

// --- Incidents ---

router.get('/incidents', async (req, res) => {
    const incidents = await prisma.incident.findMany({
        include: { service: true, assignedTo: true },
        orderBy: { createdAt: 'desc' }
    });
    res.json(incidents);
});

router.post('/incidents', async (req, res) => {
    const { title, description, serviceId } = req.body;

    // simple logic: assign to first step user of the service's policy immediately?
    // For now, just create it as TRIGGERED and unassigned, or let a separate "pager" logic handle assignment.
    // We'll implemented a basic assignment here for the MVP:

    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { 
            policy: { 
                include: { 
                    steps: { 
                        orderBy: { order: 'asc' },
                        include: { user: true }
                    } 
                } 
            } 
        }
    });

    let assignedToId = null;
    let assignedUserName = 'Unassigned';

    // Auto-assign to first person in policy
    if (service?.policy?.steps?.[0]) {
        assignedToId = service.policy.steps[0].userId;
        assignedUserName = service.policy.steps[0].user?.name || 'Unknown User';
    }

    const incident = await prisma.incident.create({
        data: {
            title,
            description,
            status: 'TRIGGERED',
            serviceId,
            assignedToId
        }
    });

    // In a real system, we would trigger notifications here.
    if (assignedToId) {
        console.log(`🚨 Incident #${incident.id} assigned to ${assignedUserName}`);
    } else {
        console.log(`🚨 Incident #${incident.id} unassigned`);
    }

    res.json(incident);
});

router.patch('/incidents/:id', async (req, res) => {
    const { id } = req.params;
    const { status, assignedToId } = req.body;

    const incident = await prisma.incident.update({
        where: { id },
        data: { status, assignedToId }
    });
    res.json(incident);
});

router.post('/incidents/:id/escalate', async (req, res) => {
    const { id } = req.params;

    const incident = await prisma.incident.findUnique({
        where: { id },
        include: { service: { include: { policy: { include: { steps: { orderBy: { order: 'asc' } } } } } } }
    });

    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const currentLevel = incident.escalationLevel;
    const nextStep = incident.service.policy?.steps.find((s: any) => s.order > currentLevel);

    if (nextStep) {
        const updated = await prisma.incident.update({
            where: { id },
            data: {
                assignedToId: nextStep.userId,
                escalationLevel: nextStep.order,
                status: 'TRIGGERED'
            }
        });
        console.log(`[ESCALATION] Incident '${incident.title}' escalated to level ${nextStep.order} (User: ${nextStep.userId})`);
        res.json(updated);
    } else {
        console.log(`[ESCALATION] Incident '${incident.title}' has reached max escalation.`);
        res.json({ message: 'Max escalation reached', incident });
    }
});

router.get('/services/oncall', async (req, res) => {
    const services = await prisma.service.findMany({
        include: {
            policy: {
                include: {
                    steps: {
                        where: { order: 1 },
                        include: { user: true }
                    }
                }
            }
        }
    });

    const onCallData = services.map((s: any) => ({
        serviceId: s.id,
        serviceName: s.name,
        primaryOnCall: s.policy?.steps[0]?.user?.name || 'Unassigned'
    }));

    res.json(onCallData);
});

// --- Users (for setup) ---
router.post('/users', async (req, res) => {
    const { name, email, phone } = req.body;
    const user = await prisma.user.create({
        data: { name, email, phone }
    });
    res.json(user);
});

router.get('/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});


export default router;
