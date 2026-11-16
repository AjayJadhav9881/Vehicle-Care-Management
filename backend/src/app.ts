import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './config/prisma';
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import documentRoutes from './routes/document.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/documents', documentRoutes);


app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vehicle Care API is running successfully!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: 'Vehicle Care database connection is working!',
    });
  } catch (error) {
    console.error('Database health check failed:', error);

    res.status(500).json({
      success: false,
      message: 'Database connection failed.',
    });
  }
});


export default app;