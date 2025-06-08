import asyncio
from typing import Optional
from contextlib import AsyncExitStack

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from openai import OpenAI
from dotenv import load_dotenv
import json
import os
load_dotenv()  # load environment variables from .env

def convert_tool_format(tool):
    """Convert MCP tool format to OpenAI function format."""
    return {
        "type": "function",
        "function": {
            "name": tool.name,
            "description": tool.description,
            "parameters": {
                "type": "object",
                "properties": tool.inputSchema["properties"],
                "required": tool.inputSchema.get("required", [])
            }
        }
    }

class MCPClient:
    def __init__(self, model: str):
        self.model = model
        self.session: Optional[ClientSession] = None
        self.available_tools = []
        self.openai = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.messages = [{
            "role": "system",
            "content": "You are a helpful Grafana dashboard assistant that can analyze and modify dashboard configurations."
        }]
        self._stack = AsyncExitStack()

    async def __aenter__(self):
        """Enter the async context."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Exit the async context."""
        await self.cleanup()

    async def connect_to_server(self, server_config):
        """Connect to the MCP server and initialize the session."""
        if self.session:
            await self.cleanup()

        try:
            server_params = StdioServerParameters(**server_config)
            
            # Use AsyncExitStack to manage the contexts
            transport = await self._stack.enter_async_context(stdio_client(server_params))
            stdio, write = transport
            
            # Create and initialize the session
            self.session = await self._stack.enter_async_context(ClientSession(stdio, write))
            init_response = await self.session.initialize()
            print(f"\nConnected to server with protocol version: {init_response.protocolVersion}")
            
            # Get available tools
            tools_response = await self.session.list_tools()
            self.available_tools = tools_response.tools
            # print(f"Available tools: {[tool.name for tool in self.available_tools]}")
            
        except Exception as e:
            print(f"Error connecting to MCP server: {str(e)}")
            await self.cleanup()
            raise

    async def process_query(self, query: str) -> str:
        """Process a query using the LLM and available MCP tools."""
        if not self.available_tools or not self.session:
            return "No tools available to process the query or session not initialized"

        try:
            self.messages.append({"role": "user", "content": query})
            
            # Convert tools to OpenAI format
            tools_for_openai = [convert_tool_format(tool) for tool in self.available_tools]
            
            # Get initial LLM response
            response = self.openai.chat.completions.create(
                model=self.model,
                tools=tools_for_openai,
                messages=self.messages
            )
            self.messages.append(response.choices[0].message.model_dump())
            
            final_text = []
            content = response.choices[0].message
            
            if content.tool_calls is None:
                final_text.append(content.content)
                return "\n".join(final_text)

            # Allow the LLM to call tools multiple times if needed
            while content.tool_calls is not None:
                tool_call = content.tool_calls[0]
                print(f"Tool call: {tool_call}")
                result = await self.process_tool_call(tool_call)
                final_text.append(f"[Tool {tool_call.function.name} executed]")
                # print(f"Tool call result: {result.json()}")

                # Add tool response to conversation
                self.messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": tool_call.function.name,
                    "content": json.dumps(result.json())
                })

                # Get next action from LLM
                response = self.openai.chat.completions.create(
                    model=self.model,
                    tools=tools_for_openai,
                    messages=self.messages
                )
                
                if response.choices is None:
                    final_text.append("No response from the tool call")
                    break
                    
                content = response.choices[0].message
                self.messages.append(content.model_dump())
                if content.content:
                    final_text.append(content.content)

            return "\n".join(final_text)
            
        except Exception as e:
            error_msg = f"Error processing query: {str(e)}"
            print(error_msg)
            return error_msg

    async def process_tool_call(self, tool_call):
        """Execute a single tool call using the MCP session."""
        if not self.session:
            return {"error": "Session not initialized"}
            
        try:
            tool_name = tool_call.function.name
            tool_args = json.loads(tool_call.function.arguments) if tool_call.function.arguments else {}
            
            result = await self.session.call_tool(tool_name, tool_args)
            return result
            
        except Exception as e:
            print(f"Error executing tool {tool_call.function.name}: {str(e)}")
            return {"error": str(e)}

    async def cleanup(self):
        """Clean up resources and close connections."""
        try:
            await self._stack.aclose()
            self.session = None
            self.available_tools = []
        except Exception as e:
            print(f"Error during cleanup: {str(e)}")
