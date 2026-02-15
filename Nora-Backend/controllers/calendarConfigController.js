import { calendarEntryTypes, calendarConfigDefaults } from '../data/mockData.js';

/**
 * GET /calendar/config
 * Returns allowed calendar entry types and form defaults (e.g. default km rate, default hourly rate).
 */
export const getCalendarConfig = (req, res) => {
  try {
    res.json({
      entryTypes: calendarEntryTypes,
      defaultKmRate: calendarConfigDefaults.defaultKmRate,
      defaultHourlyRate: calendarConfigDefaults.defaultHourlyRate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
