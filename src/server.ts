import express from 'express';
import { Request, Response } from 'express';

const app = express();
const port = process.env.PORT ?? '5000';

app.get('/health', (req: Request, res: Response): void => {
  res.status(200).json({ success: 'ok' });
});

app.listen(port, (): void => {
  console.log(`app is running on port ${port}`);
  console.log(`visit http://localhost:${port}`);
});
