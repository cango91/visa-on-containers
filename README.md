# Visa-on-Containers

A practice in polyglot micro-services architecture in NodeJS and Django.

## Use Case

A web-app to be used by a visa consultancy agency for:
+ Form management
+ Data collection
+ Job tracking
+ Content publishing
+ Payment and billing

## Services

### Common Services
+ **Authentication Service:** For both customer and employee login
+ **API Gateway:** To handle and route requests to appropriate services
+ **~~Database Service:~~** Using managed services for MVP

### Employee-Facing Services
+ **User Management:** Handles CRUD operations on user data
+ **Application Workflow:** Manages the lifecycle of each visa application. Job tracking
+ **Consultation Booking:** Manages consultant schedules and bookings
+ **Reporting and Analytics:** Performance metrics, application statuses, etc.

### Customer-Facing Services
+ **User Onboarding:** For initial data collection and document upload
+ **Form Management:** Handles form creation, validation, and modification
+ **Billing & Payments:** Manages fees and transactions
+ **Notification & Updates:** Real-time status changes for users
+ **CMS/Blog:** Providing articles to users

## Planned MVP Scope

### Common
+ Authentication
+ API Gateway

### Employee-Facing
+ User Management
+ Application Workflow

### Customer-Facing
+ User Onboarding
+ Form Management
+ Billing & Payments

## Tech-Stack
+ NodeJS
+ ExpressJS
+ Django
+ MongoDB
+ PostgreSQL
+ React
+ Docker
+ Redis
+ RabbitMQ

## Communication Protocols
+ REST for synchronous interactions
+ AMQP (RabbitMQ) for asynchronous interactions

## i18n Strategy
+ Under consideration

## Monitoring and Logging
+ To be determined (Prometheus for monitoring, Elasticsearch for logging?)

## Data Migration
+ Not applicable, starting afresh

## Versioning
+ Git for source code
+ Semantic versioning for APIs