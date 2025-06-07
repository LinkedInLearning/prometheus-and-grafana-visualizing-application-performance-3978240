#!/bin/bash

# Base URL for the application
BASE_URL="http://localhost:3000"

# Function to generate a random order
generate_order() {
    cat << EOF
{
    "customerName": "Customer $RANDOM",
    "items": [
        {
            "productId": "$RANDOM",
            "quantity": $(( RANDOM % 5 + 1 ))
        }
    ],
    "totalAmount": $(( RANDOM % 1000 ))
}
EOF
}

# Function to simulate traffic with different response types
generate_traffic() {
    while true; do
        # Generate a random number between 1 and 100
        RAND=$((RANDOM % 100 + 1))
        
        # 70% successful requests
        if [ $RAND -le 70 ]; then
            # Create a new order (success)
            echo "Creating new order..."
            curl -s -X POST -H "Content-Type: application/json" -d "$(generate_order)" "$BASE_URL/orders"
            
            # List orders (success)
            echo -e "\nListing orders..."
            curl -s "$BASE_URL/orders"
            
        # 20% 4xx errors
        elif [ $RAND -le 90 ]; then
            # Try to update non-existent order (404)
            echo -e "\nTrying to update non-existent order..."
            curl -s -X PUT -H "Content-Type: application/json" -d "$(generate_order)" "$BASE_URL/orders/999999"
            
            # Try to delete non-existent order (404)
            echo -e "\nTrying to delete non-existent order..."
            curl -s -X DELETE "$BASE_URL/orders/999999"
            
            # Send invalid JSON (400)
            echo -e "\nSending invalid JSON..."
            curl -s -X POST -H "Content-Type: application/json" -d "{invalid_json}" "$BASE_URL/orders"
            
        # 10% 5xx errors
        else
            # Send malformed request to trigger server error
            echo -e "\nTriggering server error..."
            curl -s -X POST -H "Content-Type: application/json" -d "{\"invalidField\": true}" "$BASE_URL/orders"
        fi
        
        # Wait between 1 to 3 seconds before next request
        sleep $(( RANDOM % 3 + 1 ))
    done
}

echo "Starting traffic generation..."
echo "Press Ctrl+C to stop"

# Run traffic generation
generate_traffic 