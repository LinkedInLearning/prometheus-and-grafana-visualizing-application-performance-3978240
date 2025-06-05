# Instructions for setting up the plugin from scratch

1. Set up your development environment:

Ensure you have the necessary tools installed, including Go, Mage, Node.js, and Docker.   

Use the create-plugin tool to scaffold a new plugin:
```
npm init @grafana/plugin
```

Select "datasource" as the plugin type when prompted.

2. Build the plugin:

Navigate to the plugin directory and Install the dependencies
```
cd <your-plugin> && npm install
```

Install e2e test dependencies
```
npm exec playwright install chromium
```

Build the plugin in development mode:
```
# Only works on Node <23
npm run dev
```

Start the Grafana server using Docker:
```
docker compose up
```