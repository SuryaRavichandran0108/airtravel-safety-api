const fetch = require('node-fetch');

const SHEET_ID = '1oCBdA6sp_XOTAWgMDrVsSrSQo8_n2WcLwhusJ4C6NGw';
const API_KEY = process.env.GOOGLE_API_KEY;

module.exports = async (req, res) => {
  try {
    // --- Get SafetyData values (long-term fatality rates) ---
    const safetyURL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/SafetyData!A2:B6?key=${API_KEY}`;
    const safetyRes = await fetch(safetyURL);
    const safetyData = await safetyRes.json();

    const rows = safetyData.values;

    let airFatalityRate = 0;
    let otherSum = 0;
    let otherCount = 0;

    rows.forEach(([mode, fatalityStr]) => {
      const fatalityRate = parseFloat(fatalityStr);
      if (mode.toLowerCase() === 'air') {
        airFatalityRate = fatalityRate;
      } else {
        otherSum += fatalityRate;
        otherCount++;
      }
    });

    const avgOtherRate = otherSum / otherCount;
    const saferPercent = (1 - (airFatalityRate / avgOtherRate)) * 100;

    // --- Get latest FAA weekly incidents count ---
    const faaURL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/FAA_Weekly!A2:B?key=${API_KEY}`;
    const faaRes = await fetch(faaURL);
    const faaData = await faaRes.json();

    const faaRows = faaData.values || [];
    let latestIncidentCount = 'N/A';
    if (faaRows.length > 0) {
      const lastRow = faaRows[faaRows.length - 1];
      latestIncidentCount = parseInt(lastRow[1], 10);
    }

    // --- Respond with both metrics ---
    res.status(200).json({
      safer_percent: saferPercent.toFixed(1),
      weekly_incidents: latestIncidentCount
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to calculate safety data.' });
  }
};
