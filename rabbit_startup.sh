#!/bin/bash

# Start RabbitMQ in the background
rabbitmq-server start -detached

# Wait for RabbitMQ to initialize
while ! rabbitmqctl status; do
  sleep 1
done
# sleep 60

# Delete default 'guest' user
#rabbitmqctl delete_user guest

# Array of service names, update this as services are added to the image
SERVICES=("AUTH" "SMTP" "EMAIL")

# Declare three associative arrays for each type of permission
declare -A SERVICE_CONFIGURE_MAPPING
declare -A SERVICE_WRITE_MAPPING
declare -A SERVICE_READ_MAPPING

SERVICE_CONFIGURE_MAPPING["AUTH"]="^(auth-exchange)$"
SERVICE_WRITE_MAPPING["AUTH"]="^(auth-exchange)$"
SERVICE_READ_MAPPING["AUTH"]="^(auth-exchange|gateway-exchange)$"

SERVICE_CONFIGURE_MAPPING["EMAIL"]="^(email-exchange)$"
SERVICE_WRITE_MAPPING["EMAIL"]="^(email-exchange)$"
SERVICE_READ_MAPPING["EMAIL"]="^(email-exchange)$"

SERVICE_CONFIGURE_MAPPING["SMTP"]="^(verificationEmails|newsEmails|promotionEmails|statusUpdateEmails|genericEmails)$"
SERVICE_WRITE_MAPPING["SMTP"]="^(verificationEmails|newsEmails|promotionEmails|statusUpdateEmails|genericEmails)$"
SERVICE_READ_MAPPING["SMTP"]="^(verificationEmails|newsEmails|promotionEmails|statusUpdateEmails|genericEmails|email-exchange)$"

# Loop through each service and create a RabbitMQ user for it
for SERVICE in "${SERVICES[@]}"; do
  # Read service-specific RabbitMQ credentials from Docker secrets
  RABBIT_USER=$(cat /run/secrets/${SERVICE}_RABBIT_USER)
  RABBIT_PASSWORD=$(cat /run/secrets/${SERVICE}_RABBIT_PASSWORD)

  # Create RabbitMQ user and set permissions
  rabbitmqctl add_user $RABBIT_USER $RABBIT_PASSWORD

  # Retrieve permissions for the service from mappings
  CONFIGURE=${SERVICE_CONFIGURE_MAPPING[$SERVICE]}
  WRITE=${SERVICE_WRITE_MAPPING[$SERVICE]}
  READ=${SERVICE_READ_MAPPING[$SERVICE]}

  # Set permissions based on retrieved values
  rabbitmqctl set_permissions -p / $RABBIT_USER "$CONFIGURE" "$WRITE" "$READ"
done

tail -f /dev/stdout