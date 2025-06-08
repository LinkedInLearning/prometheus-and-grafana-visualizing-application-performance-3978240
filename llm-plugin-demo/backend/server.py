from datetime import datetime
from typing import Dict, Optional, List, Any, AsyncGenerator
import os
import logging
import json
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
import aiohttp
import traceback

from mcp_client import MCPClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = os.getenv("OPENROUTER_API_URL", "https://openrouter.ai/api/v1/chat/completions")
MODEL_NAME = os.getenv("MODEL_NAME", "openai/gpt-3.5-turbo")
GRAFANA_URL = os.getenv("GRAFANA_URL", "http://localhost:3000")
GRAFANA_API_KEY = os.getenv("GRAFANA_API_KEY")
MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://localhost:8000")
USE_MCP = os.getenv("USE_MCP", "False") == "True"
PORT = int(os.getenv("PORT", "3200"))

MCP_SERVER_CONFIG = {
    "command": "/Users/opeyemionikute/Documents/mcp-grafana/mcp-grafana",
    "args": [],
    "env": {
        "GRAFANA_URL": "http://localhost:3501",
    }
}

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable is not set")
if not GRAFANA_API_KEY:
    raise ValueError("GRAFANA_API_KEY environment variable is not set")

app = FastAPI(title="Grafana Plugin Backend")

# Enable CORS for Grafana
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting server on port {PORT}")
    logger.info(f"Grafana URL: {GRAFANA_URL}")
    logger.info("CORS configuration enabled")

class DashboardInfo(BaseModel):
    dashboardId: str
    panelId: str | int
    dashboardTitle: str

class MessagePayload(BaseModel):
    text: str
    dashboard: DashboardInfo
    timestamp: str

class LLMResponse(BaseModel):
    response: str
    model_used: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MessageResponse(BaseModel):
    status: str
    message: str
    llm_response: Optional[LLMResponse] = None
    received_at: datetime = Field(default_factory=datetime.utcnow)

# In-memory storage for messages
messages: Dict[str, MessagePayload] = {}

# In-memory storage for MCP client
MCP_MODEL = os.getenv("MCP_MODEL", "anthropic/claude-3-7-sonnet")
mcp_client: MCPClient = MCPClient(MCP_MODEL)

class GrafanaDashboardManager:
    def __init__(self):
        self.base_url = MCP_SERVER_URL
        self.grafana_headers = {
            "Authorization": f"Bearer {GRAFANA_API_KEY}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    async def get_dashboard_via_grafana(self, uid: str) -> Dict:
        """Fallback method to get dashboard directly from Grafana API."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{GRAFANA_URL}/api/dashboards/uid/{uid}",
                    headers=self.grafana_headers,
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                if isinstance(e, httpx.HTTPStatusError) and e.response.status_code == 404:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Dashboard with UID {uid} not found"
                    )
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to fetch dashboard data: {str(e)}"
                )

    async def update_dashboard_via_grafana(self, uid: str, dashboard_json: Dict) -> Dict:
        """Fallback method to update dashboard directly using Grafana API."""
        async with httpx.AsyncClient() as client:
            try:
                # Ensure we have the required metadata
                if 'dashboard' not in dashboard_json:
                    dashboard_json = {'dashboard': dashboard_json}
                
                # Ensure the dashboard has the correct UID
                if 'uid' not in dashboard_json['dashboard']:
                    dashboard_json['dashboard']['uid'] = uid
                
                # Always set overwrite to True to update existing dashboard
                dashboard_json['overwrite'] = True
                
                # Ensure we have the required fields for updating
                if 'id' not in dashboard_json['dashboard']:
                    # Fetch the existing dashboard to get its ID
                    existing_dashboard = await self.get_dashboard_via_grafana(uid)
                    dashboard_json['dashboard']['id'] = existing_dashboard['dashboard']['id']
                
                logger.info(f"Updating dashboard with payload: {json.dumps(dashboard_json, indent=2)}")
                
                response = await client.post(
                    f"{GRAFANA_URL}/api/dashboards/db",
                    headers=self.grafana_headers,
                    json=dashboard_json,
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to update dashboard: {str(e)}"
                )

grafana_manager = GrafanaDashboardManager()
async def get_llm_response(text: str, dashboard_data: dict) -> LLMResponse:
    """Get a response from the LLM using OpenRouter."""
    try:
        # Get dashboard metadata
        dashboard = dashboard_data.get('dashboard', {})
        dashboard_id = dashboard.get('id')
        dashboard_uid = dashboard.get('uid')

        # Only include dashboard info if title and other fields are present
        dashboard_info=f"Dashboard UID: {dashboard_uid}"
        if 'title' in dashboard:
            # Format the dashboard data into a readable string
            dashboard_info = f"""
    Dashboard Title: {dashboard.get('title', 'Unknown')}
    Description: {dashboard.get('description', 'No description')}
    Dashboard ID: {dashboard_id}
    Dashboard UID: {dashboard_uid}

    Panels in this dashboard:
    """
            for panel in dashboard.get('panels', []):
                panel_info = f"""
    - Panel: {panel.get('title', 'Untitled')}
    Type: {panel.get('type', 'Unknown')}
    Description: {panel.get('description', 'No description')}
    Query: {panel.get('targets', [{}])[0].get('expr', 'No query')}
    """
                dashboard_info += panel_info

        # Create the prompt with dashboard context and modification capabilities
        prompt = f"""You are a Grafana dashboard assistant with the ability to modify dashboards. You have access to information about the entire dashboard:

{dashboard_info}

You can suggest and make changes to the dashboard based on the user's request. When modifying the dashboard, consider:
1. Panel layouts and organization
2. Panel titles and descriptions
3. Dashboard variables and templates
4. Panel queries and visualizations

User Question: {text}

Please provide a helpful response based on the dashboard context above. If changes are needed, explain what changes you have made and why."""

        headers = {
            "HTTP-Referer": "https://localhost:3000",
            "Authorization": f"Bearer {OPENROUTER_API_KEY}"
        }

        payload = {
            "model": MODEL_NAME,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful Grafana dashboard assistant that can analyze and modify dashboard configurations."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }

        if USE_MCP:
            async with mcp_client as client:
                await client.connect_to_server(MCP_SERVER_CONFIG)
                llm_response = await client.process_query(prompt)
                return LLMResponse(
                    response=llm_response,
                    model_used=client.model,
                    timestamp=datetime.now().isoformat()
                )

        async with httpx.AsyncClient() as client:
            response = await client.post(
                OPENROUTER_API_URL,
                headers=headers,
                json=payload,
                timeout=30.0
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"OpenRouter API error: {response.text}"
                )

            response_data = response.json()
            llm_response = response_data['choices'][0]['message']['content']
            model_used = response_data.get('model', MODEL_NAME)

            return LLMResponse(
                response=llm_response,
                model_used=model_used,
                timestamp=datetime.now().isoformat()
            )

    except Exception as e:
        traceback.print_exc()
        logger.error(f"Error getting LLM response: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting LLM response: {str(e)}"
        )

@app.post("/api/messages", response_model=MessageResponse)
async def receive_message(message: MessagePayload) -> MessageResponse:
    """Receive a message from the frontend and return a response."""
    try:
        dashboard_uid = message.dashboard.dashboardId
        if USE_MCP:
            dashboard_data = {"dashboard": {"uid": dashboard_uid}}
        else:
            dashboard_data = await grafana_manager.get_dashboard_via_grafana(dashboard_uid)
        
        llm_response = await get_llm_response(message.text, dashboard_data)
        
        return MessageResponse(
            status="success",
            message="Response generated successfully",
            llm_response=llm_response,
            received_at=datetime.now().isoformat()
        )

    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/api/messages", response_model=Dict[str, MessagePayload])
async def get_messages() -> Dict[str, MessagePayload]:
    """
    Retrieve all stored messages.
    
    Returns:
        Dict[str, MessagePayload]: Dictionary of stored messages
    """
    return messages

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting server on port {PORT}")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=PORT,
        log_level="info",
        access_log=True
    )