# Grafana Text Input Plugin

A Grafana panel plugin that allows users to send text input along with dashboard information to a backend server.

## Features

- Text input field with customizable label
- Configurable backend server URL
- Sends dashboard context with each message
- Real-time success/error feedback
- Modern UI with Grafana theme integration

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
npm exec playwright install chromium
```

3. Start the development server:
```bash
npm run dev
```

4. In another terminal, start Grafana:
```bash
docker compose up
```

5. Access Grafana at http://localhost:3000

## Configuration

The plugin can be configured through the panel options:

1. **Backend Server URL**: The endpoint where the text input will be sent
   - Default: `http://localhost:3000/api/messages`
   - Required for the plugin to function

2. **Input Label**: Customize the label shown above the text input
   - Default: "Enter text:"

## How it Works

### Frontend Component

The main panel component (`SimplePanel.tsx`) handles:
- Text input management
- Form validation
- Server communication
- Success/error state management

```typescript
const handleSubmit = async () => {
  if (!inputText.trim()) {
    setStatus({ message: 'Please enter some text', isError: true });
    return;
  }

  try {
    if (!options.backendUrl) {
      throw new Error('Backend URL is not configured');
    }

    const dashboardInfo = {
      dashboardId: window?.location?.pathname?.split('/')?.pop() || 'unknown',
      panelId: id,
      dashboardTitle: document.title,
    };

    const response = await fetch(options.backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: inputText,
        dashboard: dashboardInfo,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send data to server');
    }

    setStatus({ message: 'Successfully sent to server', isError: false });
    setInputText('');
  } catch (error: any) {
    setStatus({ message: `Error: ${error.message}`, isError: true });
  }
};
```

### API Request Format

When submitting text, the plugin sends a POST request to the configured backend URL with the following JSON structure:

```json
{
  "text": "User input text",
  "dashboard": {
    "dashboardId": "current-dashboard-id",
    "panelId": "current-panel-id",
    "dashboardTitle": "current-dashboard-title"
  },
  "timestamp": "ISO timestamp"
}
```

### Backend Server Requirements

Your backend server should:

1. Accept POST requests at the configured URL
2. Expect JSON content type
3. Handle the request body format shown above
4. Return appropriate HTTP status codes:
   - 200/201 for success
   - 4xx/5xx for errors

## Development

The plugin is built using:
- React for the UI
- Grafana UI components for consistent theming
- TypeScript for type safety
- Emotion for styling

### Project Structure

```
src/
├── components/
│   └── SimplePanel.tsx    # Main panel component
├── types.ts              # TypeScript interfaces
└── module.ts            # Plugin configuration
```

### Building for Production

To create a production build:

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the Apache License 2.0.
