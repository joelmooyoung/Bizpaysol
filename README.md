# BizPaySol

A comprehensive and secure cloud-based ACH (Automated Clearing House) processing system designed for businesses to handle electronic payments efficiently and securely.

## 🏦 About BizPaySol

BizPaySol is a production-ready, enterprise-grade ACH processing platform that enables businesses to:
- Process electronic payments (debits and credits)
- Generate NACHA-compliant files
- Manage transactions with bank-level security
- Monitor payment flows with real-time analytics

Built with modern technologies and security-first principles, BizPaySol provides a robust solution for financial institutions, fintech companies, and businesses requiring reliable ACH processing capabilities.

## ✨ Key Features

### 🔐 Security & Compliance
- **End-to-End Encryption**: AES-256 encryption for all sensitive data
- **Role-Based Access Control**: Admin, Operator, and Viewer roles
- **NACHA Compliance**: Fully compliant ACH file generation
- **Audit Trails**: Complete transaction logging and monitoring

### 💼 Transaction Processing
- **ACH Debits & Credits**: Support for both transaction types
- **Batch Processing**: Efficient handling of large transaction volumes
- **Business Day Calculations**: Automatic federal holiday recognition
- **Real-time Validation**: Transaction verification before processing

### 🌐 Modern Architecture
- **Microservices Design**: Scalable and maintainable architecture
- **Cloud-Native**: Designed for AWS, Railway, and Vercel deployment
- **RESTful APIs**: Clean, documented API endpoints
- **Real-time Updates**: Live transaction status updates

### 📊 Monitoring & Analytics
- **Prometheus Metrics**: Performance and health monitoring
- **Grafana Dashboards**: Visual analytics and reporting
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Metrics**: Real-time system performance insights

## 🛠 Technology Stack

### Backend Infrastructure
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript for type safety
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT with role-based access
- **File Processing**: NACHA file generation and validation
- **Deployment**: Railway (recommended) or Docker

### Frontend Application
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS with responsive design
- **UI Components**: Headless UI components
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Vercel (recommended)

### Database & Storage
- **Primary Database**: PostgreSQL with Supabase
- **Features**: Row Level Security (RLS), real-time subscriptions
- **Backup**: Automated database backups
- **Encryption**: Data encrypted at rest and in transit

### DevOps & Monitoring
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for local development
- **Monitoring**: Prometheus + Grafana stack
- **CI/CD**: GitHub Actions ready configuration
- **Hosting**: Railway + Vercel for production deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database (or Supabase account)
- Git for version control

### 1. Clone the Repository
```bash
git clone https://github.com/joelmooyoung/bizpaysol.git
cd bizpaysol
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials and configuration
npm run dev
```

### 3. Setup Database
- Create a Supabase project or PostgreSQL database
- Run the schema from `database/schema.sql`
- Configure connection in backend `.env` file

### 4. Setup Frontend
```bash
cd ../frontend
npm install
# Create .env.local with your API endpoints
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Default Admin: `admin@achprocessing.com` / `admin123`

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[API Documentation](docs/API.md)** - Complete API reference and examples
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Quick Start Guide](docs/QUICKSTART.md)** - Get up and running quickly
- **[Security Guide](docs/SECURITY_ENHANCEMENTS.md)** - Security features and best practices
- **[Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)** - Technical architecture overview
- **[Enhanced Deployment](docs/ENHANCED_DEPLOYMENT.md)** - Advanced deployment configurations
- **[React Query Optimization](docs/REACT_QUERY_OPTIMIZATION.md)** - Frontend performance optimization

## 🏗 Project Structure

```
bizpaysol/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Authentication & validation
│   │   ├── types/          # TypeScript type definitions
│   │   └── __tests__/      # Backend test suite
│   ├── Dockerfile          # Backend container configuration
│   └── package.json        # Backend dependencies
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utility libraries
│   │   ├── contexts/      # React context providers
│   │   └── hooks/         # Custom React hooks
│   └── package.json       # Frontend dependencies
├── database/              # Database schema and migrations
├── docs/                  # Comprehensive documentation
├── monitoring/            # Prometheus & Grafana configuration
├── docker-compose.yml     # Multi-container setup
└── deploy.sh             # Deployment automation script
```

## 🔧 Configuration

### Environment Variables

#### Backend Configuration (.env)
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_aes_encryption_key
NODE_ENV=development
PORT=5000
```

#### Frontend Configuration (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚢 Deployment

### Production Deployment (Recommended)

1. **Backend on Railway**:
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically

2. **Frontend on Vercel**:
   - Connect your GitHub repository
   - Configure build settings
   - Deploy automatically

3. **Database on Supabase**:
   - Create new project
   - Run schema.sql
   - Configure connection strings

### Docker Deployment
```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Development with hot reload
docker-compose up -d
```

## 🤝 Contributing

We welcome contributions to BizPaySol! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Open an issue on GitHub
- Contact: [support@bizpaysol.com](mailto:support@bizpaysol.com)

## 🔗 Links

- **Production Demo**: [https://bizpaysol.vercel.app](https://bizpaysol.vercel.app)
- **API Documentation**: [https://api.bizpaysol.com/docs](https://api.bizpaysol.com/docs)
- **Status Page**: [https://status.bizpaysol.com](https://status.bizpaysol.com)

---

**BizPaySol** - Secure, Scalable, and Compliant ACH Processing Solution
