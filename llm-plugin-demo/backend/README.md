# Grafana Plugin Backend Server

A simple FastAPI server that receives and stores messages from the Grafana Text Input Plugin.

## Features

- FastAPI server with Pydantic models for type safety
- CORS enabled for Grafana communication
- In-memory storage of messages
- Type checking with mypy
- API documentation with Swagger UI

## Setup

1. Create a virtual environment (recommended):
```bash
python3.11 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run type checking:
```bash
mypy server.py
```

4. Start the server:
```bash
python server.py
```

The server will run at http://localhost:3000

## API Endpoints

### POST /api/messages

Receives messages from the Grafana plugin.

Request body:
```json
{
  "text": "Message text",
  "dashboard": {
    "dashboardId": "dashboard-id",
    "panelId": "panel-id",
    "dashboardTitle": "Dashboard Title"
  },
  "timestamp": "2024-03-15T12:00:00Z"
}
```

Response:
```json
{
  "status": "success",
  "message": "Message received from dashboard 'Dashboard Title'",
  "received_at": "2024-03-15T12:00:01Z"
}
```

### GET /api/messages

Retrieves all stored messages.

Response:
```json
{
  "2024-03-15T12:00:00Z": {
    "text": "Message text",
    "dashboard": {
      "dashboardId": "dashboard-id",
      "panelId": "panel-id",
      "dashboardTitle": "Dashboard Title"
    },
    "timestamp": "2024-03-15T12:00:00Z"
  }
}
```

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: http://localhost:3000/docs
- ReDoc: http://localhost:3000/redoc

## Development

The server uses:
- FastAPI for the web framework
- Pydantic for data validation
- mypy for static type checking
- uvicorn for the ASGI server

### Type Checking

The project uses strict mypy settings for type safety. Run type checking with:
```bash
mypy server.py
``` 