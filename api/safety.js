const { google } = require('googleapis');

const sheetId = '1oCBdA6sp_XOTAWgMDrVsSrSQo8_n2WcLwhusJ4C6NGw';
const sheetName = 'SafetyData';

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // 👈 allows fetch from any domain
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    const sheets = google.sheets({ version: 'v4' });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A2:B6`,
      key: process.env.GOOGLE_API_KEY
    });

    const rows = response.data.values;
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

    const averageOther = otherSum / otherCount;
    const saferPercent = (1 - (airFatalityRate / averageOther)) * 100;

    res.status(200).json({ safer_percent: saferPercent.toFixed(1) });
  } catch (error) {
    console.error("API error:", error.message);
    res.status(500).json({ error: 'Failed to calculate safety percentage.' });
  }
};
