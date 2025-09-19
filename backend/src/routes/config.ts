import { Router } from 'express';
import { DatabaseService } from '@/services/databaseService';

const router = Router();
const dbService = new DatabaseService();

// Get system configuration
router.get('/', async (req, res) => {
  try {
    const result = await dbService.select('system_config');
    
    if (result.error) {
      return res.status(500).json({ 
        error: 'Failed to retrieve configuration',
        details: result.error 
      });
    }

    // Convert array of config items to object
    const config = result.data?.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {}) || {};

    res.json({ config });
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update configuration
router.post('/', async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config || typeof config !== 'object') {
      return res.status(400).json({ error: 'Invalid configuration data' });
    }

    // Update each configuration item
    for (const [key, value] of Object.entries(config)) {
      await dbService.query(
        'INSERT INTO system_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        [key, value]
      );
    }

    res.json({ message: 'Configuration updated successfully' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as configRouter };