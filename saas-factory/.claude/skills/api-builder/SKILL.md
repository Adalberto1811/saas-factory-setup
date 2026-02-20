name: api-builder
description: Use when building REST/GraphQL APIs with Python (FastAPI or Django). For API design, authentication, documentation, testing, mock services, observability, and production deployment.
---

# API Builder

End-to-end Python API development guide: from design to production deployment.

## 🎯 Overview

This skill provides comprehensive guidance for building production-grade APIs with:
- **FastAPI** - High-performance async-first APIs with Pydantic V2
- **Django** - Enterprise-grade apps with DRF and "batteries included"
- **API Documentation** - OpenAPI 3.1, SDKs, and developer portals
- **Mock Services** - Parallel development and comprehensive testing
- **Observability** - Logs, traces, metrics, and health checks

---

## 📋 Quick Start: Framework Selection

```markdown
Choose your framework based on project needs:

| Criteria | FastAPI | Django |
|:---------|:--------|:-------|
| **Primary Use** | High-concurrency APIs | Full-featured web apps |
| **Async Support** | Native, first-class | Available (Django 5.x) |
| **ORM** | SQLAlchemy 2.0 | Django ORM |
| **Learning Curve** | Low (Python hints) | Medium (conventions) |
| **Admin Panel** | Manual setup | Built-in |
| **Best For** | Microservices, ML APIs | SaaS, E-commerce |
```

---

## 🔧 Framework-Specific Guides

### FastAPI Development
- Async/await patterns for high-concurrency
- Pydantic V2 for data validation
- SQLAlchemy 2.0 async with asyncpg
- Background tasks and task queues
- **[📖 Full Guide: references/fastapi-patterns.md](references/fastapi-patterns.md)**

### Django Development
- Django 5.x async views and middleware
- ORM optimization (select_related, prefetch_related)
- Django REST Framework (DRF) patterns
- Celery for background tasks
- **[📖 Full Guide: references/django-patterns.md](references/django-patterns.md)**

---

## 🔐 Authentication & Security

### Supported Patterns
| Pattern | FastAPI | Django |
|:--------|:--------|:-------|
| JWT Tokens | python-jose, pyjwt | djangorestframework-simplejwt |
| OAuth2/OIDC | authlib, python-social-auth | django-allauth |
| API Keys | Custom middleware | DRF TokenAuth |
| RBAC | Custom decorators | django-guardian |
