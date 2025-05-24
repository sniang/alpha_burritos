# Alpha Burritos API

This project provides a RESTful API using Express.js to serve JSON data and images from a structured directory.

## API Endpoints

### 1. List JSON Files

**GET** `/api/:year/:month/json`

- Returns a list of JSON filenames for the specified year and month.
- Example: `/api/2024/05/json`
- Response:
  ```json
  ["file-2024-05-01.json", "file-2024-05-02.json"]
  ```

### 2. Get JSON File Content

**GET** `/api/json/:filename`

- Returns the parsed JSON content of the specified file.
- Example: `/api/json/file-2024-05-01.json`
- Response:
  ```json
  { "key": "value", ... }
  ```

### 3. Get Combined Image

**GET** `/api/img_all/:jsonFilename`

- Returns the PNG image associated with the JSON file (from the `Together` subdirectory).
- Example: `/api/img_all/file-2024-05-01.json`
- Response:  
  Binary PNG image.

### 4. Get Detector-Specific Image

**GET** `/api/img/:detector/:jsonFilename`

- Returns the PNG image for a specific detector and JSON file.
- Example: `/api/img/DetectorA/file-2024-05-01.json`
- Response:  
  Binary PNG image.

## Error Handling

- Returns `404` if a file or image is not found.
- Returns `400` for invalid requests.
- Returns `500` for server errors.

## Directory Structure

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
      DetectorB/
        file-YYYY-MM-DD.png
```

## Development

- Start the server:
  ```bash
  node server.js
  ```
- The server runs on port `3001` by default.

---

This API is built with Express and supports CORS and JSON request bodies.