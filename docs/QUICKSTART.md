# Development Quick Start Guide

## Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (free tier available)

## Quick Setup (5 minutes)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Ach-processing-system
```

### 2. Database Setup

1. Create a free [Supabase](https://supabase.com) project
2. Copy `database/schema.sql` and run it in Supabase SQL Editor
3. Note your project URL and keys from Settings > API

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ENCRYPTION_KEY=your_32_character_key_here_123456
JWT_SECRET=your_jwt_secret_key_here
```

Start backend:
```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start frontend:
```bash
npm run dev
```

### 5. Access the Application

- Open http://localhost:3000
- Login with: `admin@achprocessing.com` / `admin123`
- **Change the password immediately!**

## Demo Features

### Create Your First Transaction

1. Navigate to "Transactions" → "New Transaction"
2. Fill in sample data:
   - DR Routing: `123456789`
   - DR Account: `1234567890`
   - CR Routing: `987654321`
   - CR Account: `0987654321`
   - Amount: `1000.00`
3. Submit to create encrypted transaction

### Generate NACHA File

1. Go to "NACHA Files"
2. Click "Generate New File"
3. Select today's date and "DR" type
4. Download and view the generated NACHA file

### Configure System

1. Go to "Settings" (Admin only)
2. Configure ACH company information
3. Set up SFTP settings for file transmission

## Development Workflow

### Code Structure

```
├── backend/          # Express API server
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic
│   │   ├── types/    # TypeScript types
│   │   └── middleware/
├── frontend/         # Next.js React app
│   ├── src/
│   │   ├── app/      # Next.js app router
│   │   ├── components/
│   │   ├── contexts/
│   │   └── lib/
├── database/         # SQL schema
└── docs/            # Documentation
```

### Key Technologies

- **Backend**: Express, TypeScript, Supabase client, JWT, bcrypt
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Hook Form
- **Database**: PostgreSQL via Supabase with RLS
- **Security**: AES-256 encryption, JWT auth, RBAC

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test
```

### Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Common Development Tasks

### Adding New API Endpoint

1. Define types in `backend/src/types/index.ts`
2. Add route in `backend/src/routes/`
3. Update frontend API client in `frontend/src/lib/api.ts`
4. Create UI components as needed

### Adding New Database Table

1. Add SQL to `database/schema.sql`
2. Update TypeScript types
3. Add database service methods
4. Create API endpoints
5. Build frontend UI

### Implementing New Feature

1. Design database schema changes
2. Implement backend services and APIs
3. Create frontend components
4. Add proper authentication/authorization
5. Write tests
6. Update documentation

## Debugging

### Backend Debugging

- API runs on http://localhost:3001
- Check `/health` endpoint for status
- Monitor console for SQL queries and errors
- Use Supabase dashboard to view data

### Frontend Debugging

- App runs on http://localhost:3000  
- Check browser console for errors
- Use React DevTools for component debugging
- Monitor network tab for API calls

### Database Debugging

- Use Supabase dashboard SQL editor
- Check Table Editor for data
- Monitor Authentication logs
- Review API logs

## Security Best Practices

### Environment Variables

- Never commit `.env` files
- Use strong, unique secrets
- Rotate keys regularly
- Use different keys per environment

### Data Handling

- Account numbers are automatically encrypted
- Passwords are hashed with bcrypt
- JWTs expire after 7 days by default
- API uses CORS protection

### Access Control

- Role-based permissions (Admin/Operator/Viewer)
- API endpoints protected by middleware
- Database has Row Level Security (RLS)
- Frontend routes require authentication

## Performance Considerations

### Backend

- Database queries use indexes
- Pagination implemented for large datasets
- Connection pooling via Supabase
- Sensitive data encrypted before storage

### Frontend

- Next.js optimizations enabled
- Component lazy loading where appropriate
- API responses cached when possible
- Images optimized automatically

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3001
   npx kill-port 3001
   ```

2. **Database connection fails**
   - Check Supabase URL and keys
   - Verify project is not paused
   - Check internet connection

3. **CORS errors**
   - Verify FRONTEND_URL in backend .env
   - Check API URL in frontend .env.local

4. **Build failures**
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify all dependencies are installed

### Getting Help

1. Check the console for error messages
2. Review the API documentation in `/docs/API.md`
3. Check Supabase dashboard for database issues
4. Use browser DevTools for frontend debugging

## Next Steps

Once you have the system running:

1. **Customize for your needs**
   - Update company information
   - Configure ACH settings
   - Set up SFTP credentials

2. **Add business logic**
   - Custom validation rules
   - Additional transaction types
   - Integration with existing systems

3. **Deploy to production**
   - Follow `/docs/DEPLOYMENT.md`
   - Set up monitoring and backups
   - Configure security policies

4. **Scale the system**
   - Add more users and roles
   - Implement additional features
   - Optimize for your transaction volume

Happy coding! 🚀