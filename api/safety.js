const { google } = require('googleapis');

const sheetId = '1oCBdA6sp_XOTAWgMDrVsSrSQo8_n2WcLwhusJ4C6NGw';
const sheets = google.sheets({ version: 'v4' });

module.exports = async (req, res) => {
  try {
    // Fetch fatality data from SafetyData tab
    const safetyData = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'SafetyData!A2:B6',
      key: process.env.AIzaSyCBO20AfI7OzYwBYworbfJRIOZ7qlv_S5c,
    });

    const rows = safetyData.data.values;

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

    // Fetch most recent FAA weekly incident count
    const faaSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'FAA_Weekly!A2:B', // Assuming A = Date, B = Incident Count
      key: process.env.AIzaSyCBO20AfI7OzYwBYworbfJRIOZ7qlv_S5c,
    });

    const faaRows = faaSheet.data.values;
    let latestIncidentCount = null;

    if (faaRows && faaRows.length > 0) {
      const lastRow = faaRows[faaRows.length - 1];
      latestIncidentCount = parseInt(lastRow[1], 10); // Column B is incident count
    }

    res.status(200).json({
      safer_percent: saferPercent.toFixed(1),
      weekly_incidents: latestIncidentCount ?? 'N/A',
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to calculate safety data.' });
  }
};
