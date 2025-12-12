import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'izabels-revalidate-2024';

/**
 * Webhook для ревалидации Next.js кеша после изменений в админке
 * POST /api/webhooks/revalidate
 */
router.post('/revalidate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { type, sku, path } = req.body;

    // Вызываем Next.js revalidation API
    const response = await fetch(`${FRONTEND_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: REVALIDATE_SECRET,
        type,
        sku,
        path,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Frontend revalidation failed:', error);
      return res.status(500).json({ 
        error: 'Failed to revalidate frontend cache',
        details: error 
      });
    }

    const result = await response.json() as Record<string, any>;
    res.json({ 
      success: true, 
      message: 'Cache revalidated successfully',
      ...(typeof result === 'object' && result !== null ? result : {})
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook failed' });
  }
});

export default router;

