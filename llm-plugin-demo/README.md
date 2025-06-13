# LLM Plugin Demo

The code is this folder is used to demonstrate a simple LLM for Grafana using a backend service along with RAG and MCP capabilities.

To start the server:
1. Configure environment variables
    ```
    cd llm-plugin-demo/
    cp .env.example .env
    ```

2. Make sure to set USE_MCP to `False` before you set up the MCP server later.

3. Create an OpenRouter API key. Note that you'll need to fund some credits to use some models: https://openrouter.ai/. Most requests in this example cost a fraction of a dollar.

4. Start the backend server:
    ```
    cd backend/

    virtualenv .venv
    source .venv/bin/activate
    pip install -r requirements.txt

    python server.py
    ```

5. Spin up a Grafana environment that has the custom plugin installed:
    ```
    cd ../opeonikute-grafanaplugindemo-panel
    npm run dev

    # On a different terminal, spin up the docker environments
    cd opeonikute-grafanaplugindemo-panel (#TODO: Change this to actual path)
    docker-compose up -d
    ```

6. Access the Grafana environment at http://localhost:3501