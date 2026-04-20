# System Design - E-Commerce Platform

## Overview

The e-commerce platform is built using a **microservices architecture** designed for scalability, maintainability, and high availability. This document outlines the overall system design, architecture patterns, and technology stack.

## Architecture Principles

1. **Microservices**: Independent, loosely coupled services
2. **Event-Driven**: Asynchronous communication via Kafka
3. **Database per Service**: Data isolation and autonomy
4. **API Gateway**: Single entry point for clients
5. **Containerization**: Docker for consistency and deployment
6. **Orchestration**: Docker Compose for local dev, Kubernetes for production

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client Layer                      │
│          (Web, Mobile, Third-party Apps)            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────┐
│               API Gateway (Port 5000)               │
│      (Request Routing, Authentication, Logging)    │
└────┬────────┬────────┬────────┬────────────────────┘
     │        │        │        │
     ▼        ▼        ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Auth   │ │Product │ │ Cart   │ │ Order  │
│Service │ │Service │ │Service │ │Service │
│:3001   │ │:3002   │ │:3003   │ │:3004   │
└────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘
     │          │          │          │
     └──────────┼──────────┼──────────┘
                │          │
                ▼          ▼
         ┌──────────────────────┐
         │   Event Bus (Kafka)  │
         │   (Async Messaging)  │
         └──────────────────────┘
                │          │
         ┌──────┴──────────┴──────┐
         │                        │
         ▼                        ▼
┌──────────────────┐    ┌──────────────────┐
│ Data Layer       │    │  Cache Layer     │
│ • MongoDB        │    │ • Redis          │
│ • Separate DBs   │    │ • Session Store  │
│   per service    │    │ • Cache          │
└──────────────────┘    └──────────────────┘
```

## Core Components

### 1. API Gateway
- **Purpose**: Single entry point for all client requests
- **Port**: 5000
- **Responsibilities**:
  - Request routing to microservices
  - Authentication and authorization
  - Request/response logging
  - Rate limiting
  - Error handling

### 2. Microservices

#### Auth Service (Port 3001)
- User registration and login
- JWT token generation and validation
- Password management
- User profile management

#### Product Service (Port 3002)
- Product catalog management
- Search and filtering
- Inventory management
- Product recommendations

#### Cart Service (Port 3003)
- Add/remove items from cart
- Cart management
- Cart persistence
- Checkout initiation

#### Order Service (Port 3004)
- Order creation and processing
- Order tracking
- Order history
- Payment integration

### 3. Data Layer

#### MongoDB
- Primary database for all services
- Separate databases per service for data isolation
- Replica set support for high availability
- Collections:
  - Auth: users, sessions, tokens
  - Product: products, categories, inventory
  - Cart: carts, items
  - Order: orders, order_items, payments

#### Redis
- High-speed caching
- Session management
- Real-time data
- Rate limiting
- Cache TTL for automatic expiration

### 4. Message Broker

#### Kafka
- Event streaming platform
- Asynchronous inter-service communication
- Event logging and replay
- Multiple topics for different event types

## Communication Patterns

### Synchronous Communication
```
Client ──→ API Gateway ──→ Service ──→ Response
```
Used for:
- Direct API calls
- Request-response operations
- Real-time data retrieval

### Asynchronous Communication
```
Service ──→ Kafka Topic ──→ Event Listeners ──→ Processing
```
Used for:
- Event notifications
- Order processing
- Inventory updates
- Notification sending

## Data Flow Examples

### User Registration Flow
1. Client sends registration request to API Gateway
2. Gateway routes to Auth Service
3. Auth Service validates input
4. Auth Service stores user in MongoDB
5. Auth Service publishes "user.created" event to Kafka
6. Other services consume event as needed
7. Response sent back to client

### Order Processing Flow
1. Client initiates checkout from Cart Service
2. Cart Service creates preliminary order
3. Cart Service publishes "order.created" event
4. Order Service consumes event and creates order record
5. Product Service updates inventory
6. Payment Service processes payment
7. Order status updated
8. Client receives confirmation

## Service Dependencies

```
Cart Service ─→ Product Service (verify product availability)
                     ↓
                Auth Service (verify user)
                     ↓
                MongoDB + Redis

Order Service ─→ Cart Service (get cart items)
                     ↓
                Product Service (update inventory)
                     ↓
                Auth Service (verify user)
```

## Scalability Considerations

### Horizontal Scaling
- Each service can be scaled independently
- Load balancer distributes traffic
- Stateless service design enables easy scaling

### Database Scaling
- MongoDB replication for read distribution
- Sharding for large datasets
- Redis clustering for high-volume caching

### Caching Strategy
- Multi-level caching: Application, Redis, Database
- Cache invalidation events via Kafka
- TTL-based automatic cache expiration

## Security Architecture

### Authentication
- JWT-based authentication
- Secure token storage in Redis
- Token expiration and refresh mechanisms

### Authorization
- Role-based access control (RBAC)
- Service-to-service authentication
- API key management

### Data Protection
- Encryption in transit (HTTPS/TLS)
- Encryption at rest in databases
- PII data masking in logs

## Monitoring and Observability

### Logging
- Centralized logging for all services
- Structured logs (JSON format)
- Log aggregation for analysis

### Metrics
- Service health metrics
- Performance monitoring
- Resource utilization tracking

### Tracing
- Distributed tracing across services
- Request correlation IDs
- End-to-end request tracking

## Deployment Architecture

### Development
- Docker Compose for local development
- All services on single machine
- Easy setup and teardown

### Production
- Kubernetes orchestration
- Auto-scaling policies
- Load balancing
- High availability setup
- Multi-region deployment (optional)

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB 7.0 |
| Cache | Redis 7.0 |
| Message Broker | Kafka 7.5 |
| Container | Docker |
| Orchestration | Docker Compose / Kubernetes |
| API Gateway | Express-based Custom Gateway |
| Reverse Proxy | Nginx |
| Authentication | JWT |

## Performance Targets

- **API Response Time**: < 200ms (p95)
- **Database Query**: < 50ms (p95)
- **Cache Hit Rate**: > 80%
- **Service Availability**: 99.9% uptime
- **Request Throughput**: 1000+ req/sec per service

## Future Enhancements

1. **API Versioning**: Multiple API versions
2. **GraphQL**: Alternative to REST API
3. **Service Mesh**: Istio for advanced traffic management
4. **Event Sourcing**: Complete event history
5. **CQRS**: Command Query Responsibility Segregation
6. **Multi-region Deployment**: Global scale
7. **Advanced Analytics**: Real-time analytics engine

## References

- [Microservices Architecture](https://microservices.io/)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [MongoDB Design Patterns](https://docs.mongodb.com/manual/core/data-model-design/)
- [Kafka Architecture](https://kafka.apache.org/documentation/)
