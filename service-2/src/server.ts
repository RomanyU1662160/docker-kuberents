import express, { Request, Response, Application } from 'express';
import cors from 'cors';

const app: Application = express();
const PORT = process.env.PORT || 5001;

//use cors
app.use(cors());
// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

const orders = [
  { id: 1, item: 'Laptop', quantity: 1, user_id: 1 },
  { id: 2, item: 'Phone', quantity: 2, user_id: 1 },
  { id: 3, item: 'Tablet', quantity: 1, user_id: 2 },
  { id: 4, item: 'Monitor', quantity: 3, user_id: 2 },
];

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Hello from service-2!, Express TypeScript Server is running.',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
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

app.get('/api/user/:id/orders', (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const userOrders = orders.filter((order) => order.user_id === userId);
  res.json({ orders: userOrders });
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
  console.log(`🚀 Service-2 Server is running on http://localhost:${PORT}`);
  console.log(
    `📊 Service-2 Health check available at http://localhost:${PORT}/health`
  );
  console.log(
    `📋 Service-2 API endpoints available at http://localhost:${PORT}/api`
  );
});

export default app;
