import { Router } from 'express';
import { BusinessDayService } from '@/services/businessDayService';

const router = Router();
const businessDayService = new BusinessDayService();

// Get all federal holidays for the current year
router.get('/', async (req, res) => {
  try {
    const holidays = businessDayService.getFederalHolidays();
    
    res.json({ 
      holidays: holidays.map(date => ({
        date,
        name: getHolidayName(date)
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to retrieve holidays',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check if a specific date is a business day
router.get('/check/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const isBusinessDay = businessDayService.isBusinessDay(date);
    const nextBusinessDay = businessDayService.getNextBusinessDay(date);
    
    res.json({
      date,
      isBusinessDay,
      nextBusinessDay
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to check business day',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get next business day from a given date
router.get('/next/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const nextBusinessDay = businessDayService.getNextBusinessDay(date);
    
    res.json({
      fromDate: date,
      nextBusinessDay
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get next business day',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

function getHolidayName(date: string): string {
  const month = date.substring(5, 7);
  const day = date.substring(8, 10);
  
  // Basic holiday name mapping
  if (month === '01' && day === '01') return "New Year's Day";
  if (month === '07' && day === '04') return "Independence Day";
  if (month === '11' && day === '11') return "Veterans Day";
  if (month === '12' && day === '25') return "Christmas Day";
  
  // For other holidays, we'd need more complex logic to determine the exact name
  return "Federal Holiday";
}

export { router as holidayRouter };