# Air Travel Safety API & Website

This project is a live, data-driven website aimed at helping nervous flyers understand the true safety of air travel through clear statistics and visual comparisons with other transportation modes.

Update 2.0 includes the “Flying Today?” function, which is a personalized reassurance tool that lets users enter a flight number (e.g., AA2025) and instantly see the weather conditions at their departure and arrival airports. It complements the broader air safety statistics on the site by offering context-specific insights.

---

## Overview
Air travel often feels intimidating, but statistical data paints a different picture. This site presents up-to-date metrics to show how much safer flying is compared to other modes of transportation such as driving, buses, trains, and motorcycles. The frontend is hosted on AWS S3, the backend API is deployed on Vercel, and the safety data is pulled live from a Google Sheet.

---

## Live Demo
**Website**: [https://skytruths.com](https://skytruths.com)  
**API Endpoint**: [https://airtravel-safety-api.vercel.app/api/safety](https://airtravel-safety-api.vercel.app/api/safety)

---

## Tech Stack
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js (serverless function on Vercel)
- Data Source: Google Sheets API
- Cloud Hosting:
  - Frontend: AWS S3
  - Backend: Vercel (serverless deployment)

---

## Project Structure
```
├── index.html              # Static site hosted on AWS S3
├── api/
│   └── safety.js           # Serverless function to fetch safety data
├── vercel.json             # Vercel routing and build configuration
├── package.json            # Project metadata and dependency list
```

---

## How It Works
1. **Data Source**: A Google Sheet contains fatality rates per 100 million passenger miles for different transportation modes.
2. **API**: The backend serverless function, hosted on Vercel, fetches this data and computes a percentage representing how much safer air travel is compared to the average of all other transport modes.
3. **Frontend**: The website uses JavaScript to call the API, retrieve the calculated value, and dynamically display it in an animated counter.
4. **User Experience**: Additional sections explain how the data is calculated and include frequently asked questions to ease common aviation concerns.

---

## Environment Variables (For API Deployment)
To deploy or run the API function locally, create a `.env` file with the following variable:
```
GOOGLE_API_KEY=AIzaSyCBO20AfI7OzYwBYworbfJRIOZ7qlv_S5c
```
Ensure the Google Sheet is either public or accessible through the API key.

---

## Inspiration
This project was created to offer a data-driven solution to alleviate fear of flying by showcasing reliable, research-backed metrics and making them accessible in an easy-to-understand format.

---

## Future Enhancements
- Integration with Chart.js for interactive visualizations
- Real-time aviation incident tracking using aviation data APIs
- Email or SMS alerts for daily travel safety insights
- User-submitted question or feedback section

---

## Contributions
Contributions are welcome. Please feel free to fork this repository, submit a pull request, or open an issue for feedback and suggestions.

---

## License
This project is licensed under the MIT License.

