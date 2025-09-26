import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Alice Johnson', email: 'alice@example.com' },
];

const service2Url = process.env.SERVICE_2_URL || 'http://localhost:5001';

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Hello from service-1!!!!, Express TypeScript Server is running.',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

app.get('/users', (req: Request, res: Response) => {
  res.json({ users });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API routes example
app.get('/api/users', (req: Request, res: Response) => {
  res.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
  });
});

app.get('/svc-2/health', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${service2Url}/health`);
    const data = await response.json();
    res.json({
      message: 'Response from service-2',
      data,
    });
  } catch (error) {
    console.error('Error calling service-2:', error);
    res.status(500).json({
      error: 'Failed to call service-2',
      message: (error as Error).message,
    });
  }
});

app.get('/svc-2/users/:id/orders', async (req: Request, res: Response) => {
  try {
    console.log('Request params.id:', req.params.id);
    const userId = parseInt(req.params.id);
    console.log('service2Url:', `${service2Url}/api/user/${userId}/orders`);
    const response = await fetch(`${service2Url}/api/user/${userId}/orders`);
    const data = await response.json();
    res.json({
      message: 'Response from service-2',
      data,
    });
  } catch (error) {
    console.error('Error calling service-2:', error);
    res.status(500).json({
      error: 'Failed to call service-2',
      message: (error as Error).message,
    });
  }
});

// 404 handler - catch all unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Service-1 Server is running on http://localhost:${PORT}`);
  console.log(
    `📊 Service-1 Health check available at http://localhost:${PORT}/health`
  );
  console.log(
    `📋 Service-1 API endpoints available at http://localhost:${PORT}/api`
  );
});

export default app;
