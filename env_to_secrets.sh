#!/bin/bash

# Backup docker-compose.yml
cp docker-compose.yml docker-compose.yml.bak

# Base directories
BASE_SERVICES_DIR="./services"
BASE_SECRETS_DIR="./secrets"

# Temporary YAML file
TMP_YAML="docker-compose-tmp.yml"

# Find the last occurrence of 'secrets:' line number in docker-compose.yml
last_secrets_line=$(tac docker-compose.yml | grep -n -m 1 'secrets:' | cut -d ":" -f1)
total_lines=$(wc -l < docker-compose.yml)
start_line=$((total_lines - last_secrets_line + 1))

# Copy content up to just before 'secrets:'
head -n $(($start_line - 1)) docker-compose.yml > "$TMP_YAML"

# Append new secrets section
echo "secrets:" >> "$TMP_YAML"

# Loop through each service directory in 'services'
for service_dir in $(find "$BASE_SERVICES_DIR" -maxdepth 1 -mindepth 1 -type d); do
    service_name=$(basename "$service_dir")
    env_file="$service_dir/.env"
    target_dir="$BASE_SECRETS_DIR/$service_name"

    # Check if .env exists in the service directory
    if [[ -f "$env_file" ]]; then
        # Create 'secrets' directory if not exists
        mkdir -p "$target_dir"

        # Read .env line by line
        while IFS= read -r line || [ -n "$line" ]; do
            key=$(echo "$line" | cut -d '=' -f 1)
            value=$(echo "$line" | cut -d '=' -f 2-)
            echo "$value" > "$target_dir/$key.txt"

            # Append this secret to the temporary YAML file
            echo "  ${key}:" >> "$TMP_YAML"
            echo "    file: ./secrets/$service_name/$key.txt" >> "$TMP_YAML"
        done < "$env_file"
    fi
done

# Replace original YAML file with the temporary one
mv "$TMP_YAML" docker-compose.yml


# #!/bin/bash

# # Base directories
# BASE_SERVICES_DIR="./services"
# BASE_SECRETS_DIR="./secrets"

# # Loop through each service directory in 'services'
# for service_dir in $(find "$BASE_SERVICES_DIR" -maxdepth 1 -mindepth 1 -type d); do
#     service_name=$(basename "$service_dir")
#     env_file="$service_dir/.env"
#     target_dir="$BASE_SECRETS_DIR/$service_name"

#     # Check if .env exists in the service directory
#     if [[ -f "$env_file" ]]; then
#         # Create corresponding 'secrets' directory if not exists
#         mkdir -p "$target_dir"

#         # Read .env line by line
#         while IFS= read -r line || [ -n "$line" ]; do
#             key=$(echo "$line" | cut -d '=' -f 1)
#             value=$(echo "$line" | cut -d '=' -f 2-)
#             echo "$value" > "$target_dir/$key.txt"
#         done < "$env_file"
#     fi
# done