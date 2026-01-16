# Documentation Index

Complete index of all documentation in the Taist monorepo.

---

## Quick Links

- [Root README](../README.md) - Project overview and quick start
- [Backend README](../backend/README.md) - Laravel API documentation
- [Frontend README](../frontend/README.md) - React Native app documentation

---

## Getting Started

| Document | Description |
|----------|-------------|
| [Quick Start](setup/quick-start.md) | 5-minute setup guide |
| [Local Development](setup/local-development.md) | Complete local environment setup |
| [Database Setup](setup/database-copy-guide.md) | Database configuration and copying |
| [Quick DB Copy](setup/quick-db-copy.md) | Simplified database copy guide |

---

## Features

| Document | Description |
|----------|-------------|
| [AI Features](features/ai-features.md) | AI menu descriptions and review generation |
| [Chef Availability System](features/chef-availability-system.md) | Chef scheduling and availability |
| [Notification System](features/NOTIFICATION_IMPLEMENTATION_GUIDE.md) | Push notification implementation |
| [Notification Types](features/NOTIFICATION_TYPES_INVENTORY.md) | Complete notification type mapping |
| [SMS Notifications](features/twilio-implementation.md) | Twilio SMS implementation |
| [Twilio Setup](features/twilio-setup.md) | Twilio configuration guide |
| [SMS Reference](features/sms-notifications-reference.md) | SMS notifications reference |
| [Stripe Verification](features/STRIPE_VERIFICATION_FIXES.md) | Stripe verification fixes |
| [Stripe Return UX](features/STRIPE_RETURN_UX_IMPLEMENTATION.md) | Stripe return flow implementation |
| [Performance Guide](features/REACT_NATIVE_PERFORMANCE_GUIDE.md) | React Native performance tips |

---

## Infrastructure

| Document | Description |
|----------|-------------|
| [AWS Setup](infrastructure/aws-setup.md) | AWS configuration guide |
| [Domain Migration](infrastructure/domain-migration.md) | Domain strategy and migration |

---

## Deployment

| Document | Description |
|----------|-------------|
| [Deployment Summary](deployment/deployment-summary.md) | Deployment overview |
| [Railway Migration Guide](deployment/RAILWAY-MIGRATION-GUIDE.md) | Railway hosting migration |
| [Railway Quick Setup](deployment/RAILWAY-QUICK-SETUP.md) | Quick Railway setup |
| [Railway Connection Details](deployment/RAILWAY-CONNECTION-DETAILS.md) | Railway connection info |
| [Railway Setup First](deployment/RAILWAY-SETUP-FIRST.md) | Initial Railway setup |
| [Railway DB Copy](deployment/RAILWAY-DB-COPY-QUICK-START.md) | Database copy to Railway |
| [Local to Railway DB](deployment/LOCAL-TO-RAILWAY-DB-COPY-PLAN.md) | Local to Railway migration |
| [Railway Storage](deployment/RAILWAY_PERSISTENT_STORAGE.md) | Persistent storage on Railway |

---

## UI/UX

| Document | Description |
|----------|-------------|
| [UI Documentation](ui/ui-documentation.md) | Complete UI reference |

---

## Configuration & Reference

| Document | Description |
|----------|-------------|
| [Version Management](VERSION-MANAGEMENT.md) | Version numbering guide |
| [Google Maps Setup](GOOGLE-MAPS-API-SETUP.md) | Google Maps API configuration |
| [Admin User Creation](ADMIN-USER-CREATION.md) | Creating admin users |
| [Quick Admin Setup](QUICK-ADMIN-SETUP.md) | Quick admin setup |

---

## Archived Documentation

Historical documentation preserved for reference in `archive/`.

### Analysis Reports
Located in `archive/analysis-reports/`:
- Bug reports and investigations
- System analysis documents
- Availability and timezone audits

### Implementation Plans
Located in `archive/implementation-plans/`:
- Admin dashboard plans
- Performance optimization plans
- Feature implementation plans
- Bug fix documentation

### Sprint 1 Archive
Located in `archive/sprint-1/`:
- Task implementation summaries (TMA-001 through TMA-022)
- Sprint changelog and planning documents

### Migration History
Located in `archive/migration-history/`:
- Migration fixes and recovery plans
- Config migration summaries

### Other Archives
- `archive/plans/` - Feature planning documents
- `archive/ai-features-implementation/` - AI features implementation details
- `archive/performance/` - Performance analysis reports

---

## Frontend Documentation

| Document | Location |
|----------|----------|
| [Frontend README](../frontend/README.md) | Main frontend documentation |
| [CHANGELOG](../frontend/CHANGELOG.md) | Version history |
| [Deployment Guide](../frontend/DEPLOYMENT.md) | Deployment instructions |
| [Android Guide](../frontend/android_guide.md) | Android-specific setup |
| [Version Bump Guide](../frontend/VERSION-BUMP-GUIDE.md) | Version management |

---

## Backend Documentation

| Document | Location |
|----------|----------|
| [Backend README](../backend/README.md) | Main backend documentation |
| [Routes README](../backend/routes/README.md) | API routes documentation |

---

## Directory Structure

```
docs/
├── setup/              # Getting started guides
├── features/           # Feature documentation
├── infrastructure/     # Infrastructure setup
├── deployment/         # Deployment guides
├── ui/                 # UI documentation
├── archive/            # Historical documentation
│   ├── analysis-reports/
│   ├── implementation-plans/
│   ├── sprint-1/
│   ├── migration-history/
│   ├── plans/
│   ├── ai-features-implementation/
│   └── performance/
├── ADMIN-USER-CREATION.md
├── GOOGLE-MAPS-API-SETUP.md
├── QUICK-ADMIN-SETUP.md
├── VERSION-MANAGEMENT.md
└── DOCUMENTATION-INDEX.md
```

---

*Last updated: January 2026*
