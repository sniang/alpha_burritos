# Alpha Burritos

Alpha Burritos is a React application designed to browse, visualize, and analyze detector signals from the "burrito detectors" of the ALPHA experiment. The application communicates with a RESTful API (see below) to fetch JSON data and PNG images for various detectors and acquisition timestamps.

<p align="center">
  <img src="alpha-burritos.png" alt="Alpha Burritos Logo" width="300"/>
</p>

## Features

- **Year/Month Selection:** Choose the year and month to filter available data files.
- **Timestamp Selection:** Select a specific acquisition timestamp from available JSON files.
- **Parameter Display:** View key parameters (area, FWHM, peak, rise, time peak) for each detector.
- **Combined Image View:** See the combined detector image for the selected acquisition.
- **Detector Selection:** Choose a specific detector (PDS, BDS, DSAT, USAT, PMT11) to view its processed image.
- **Signal Download:** Download the raw signal as a text file for the selected detector and timestamp.
- **Download All Signals:** Download signal files for all available detectors at once.
- **Auto-Refresh:** Automatically refresh the list of available files.
- **Responsive UI:** Built with React and styled for clarity and usability.

## Project Structure

```
src/
  App.jsx                # Main React component
  MainTitle.jsx          # App title and logo
  YearMonthSelector.jsx  # Dropdowns for year/month selection
  TimeStampSelector.jsx  # Dropdown for timestamp/file selection
  Parameters.jsx         # Displays detector parameters from JSON
  DetectorImageAll.jsx   # Shows combined detector image
  DetectorSelector.jsx   # Dropdown for detector selection
  DetectorImage.jsx      # Shows image for selected detector
  DownloadButton.jsx     # Button to download the signal as a text file
  AutoRefresh.jsx        # Checkbox to enable/disable auto-refresh
  assets/                # Static assets (e.g., ALPHA logo)
  CSS/                   # App and global CSS
  main.jsx               # React entry point
```

## How It Works

1. **Select Year/Month:**  
   Use the dropdowns to pick a year and month. The app fetches available JSON files for that period.

2. **Select Timestamp:**  
   Choose a file (timestamp) from the dropdown. The app loads its parameters and images.

3. **View Parameters:**  
   The `Parameters` panel displays key values for each detector.

4. **View Images:**  
   - The combined image is shown by default.
   - Use the detector dropdown to view images for individual detectors.

5. **Download Signals:**  
   - Use the "Download the signal" button to download the raw signal for the selected detector.
   - Use the "Download the signals" button to download signals for all available detectors at once.

6. **Auto-Refresh:**  
   Enable auto-refresh to automatically update the list of available files every 2 seconds.

## API Endpoints

The React app expects the following backend API (see `server.js`):

- **List JSON Files:**  
  `GET /api/:year/:month/json`  
  - Returns a list of JSON filenames for the specified year and month.
  - Example: `/api/2024/05/json`
  - Response:
    ```json
    ["file-2024-05-01.json", "file-2024-05-02.json"]
    ```

- **Get JSON File Content:**  
  `GET /api/json/:filename`  
  - Returns the parsed JSON content of the specified file.
  - Example: `/api/json/file-2024-05-01.json`
  - Response:
    ```json
    { "key": "value", ... }
    ```

- **Get Combined Image:**  
  `GET /api/img_all/:jsonFilename`  
  - Returns the PNG image associated with the JSON file (from the `Together` subdirectory).
  - Example: `/api/img_all/file-2024-05-01.json`
  - Response:  
    Binary PNG image.

- **Get Detector-Specific Image:**  
  `GET /api/img/:detector/:jsonFilename`  
  - Returns the PNG image for a specific detector and JSON file.
  - Example: `/api/img/DetectorA/file-2024-05-01.json`
  - Response:  
    Binary PNG image.

- **Get Detector-Specific Signal:**  
  `GET /api/signal/:detector/:jsonFilename`  
  - Returns the signal as a text file for a specific detector and JSON file.
  - Example: `/api/signal/DetectorA/file-2024-05-01.json`
  - Response:  
    Text file

### Error Handling

- Returns `404` if a file or image is not found.
- Returns `400` for invalid requests.
- Returns `500` for server errors.

### Directory Structure

The API expects files to be organized as:
```
MAIN_DIR/
  YYYY/
    MM/
      JSON/
        file-YYYY-MM-DD.json
      Together/
        file-YYYY-MM-DD.png
      DetectorA/
        file-YYYY-MM-DD.png
        file-YYYY-MM-DD.txt
      DetectorB/
        file-YYYY-MM-DD.png
        file-YYYY-MM-DD.txt
```

## Development

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Install dependencies

```bash
npm install
```

### Start the React app

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

### Start the backend API

```bash
node server.js
```

The API will run on [http://localhost:3001](http://localhost:3001).

## Customization

- **API URL:**  
  If your backend runs on a different host or port, update the API URLs in the React components (e.g., `Parameters.jsx`, `DetectorImage.jsx`, etc.).

- **Data Directory:**  
  The backend expects data in a specific directory structure (see API documentation above).
  The main directory of the data has to be declared in the variable `MAIN_DIR` in [server.js](server.js).

---

## Useful Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Express Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/en/docs)
- [JavaScript Reference (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)
- [JSON Format](https://www.json.org/json-en.html)
- [RESTful API Design](https://restfulapi.net/)
- [GitHub Guides](https://guides.github.com/)
- [ALPHA Experiment (CERN)](https://home.cern/science/experiments/alpha)

---
This project uses React, Vite, and Express. For backend API details, see [server.js](server.js).

---
**Developed by Samuel Niang (Swansea University) and Adriano Del Vincio (Brescia University)**