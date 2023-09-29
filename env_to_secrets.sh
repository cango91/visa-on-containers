#!/bin/bash

# Base directories
BASE_SERVICES_DIR="./services"
BASE_SECRETS_DIR="./secrets"

# Loop through each service directory in 'services'
for service_dir in $(find "$BASE_SERVICES_DIR" -maxdepth 1 -mindepth 1 -type d); do
    service_name=$(basename "$service_dir")
    env_file="$service_dir/.env"
    target_dir="$BASE_SECRETS_DIR/$service_name"

    # Check if .env exists in the service directory
    if [[ -f "$env_file" ]]; then
        # Create corresponding 'secrets' directory if not exists
        mkdir -p "$target_dir"

        # Read .env line by line
        while IFS= read -r line || [ -n "$line" ]; do
            key=$(echo "$line" | cut -d '=' -f 1)
            value=$(echo "$line" | cut -d '=' -f 2-)
            echo "$value" > "$target_dir/$key.txt"
        done < "$env_file"
    fi
done