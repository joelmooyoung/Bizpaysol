# Bizpaysol - ACH Processing System

A comprehensive ACH (Automated Clearing House) processing system with web interface and API for managing financial transactions and generating NACHA-compliant ACH files.

## Features

- **Web-based Management Interface**: Submit transactions and manage ACH processing through a clean, responsive web interface
- **RESTful API**: Programmatic access to all system functionality
- **ACH File Generation**: Creates NACHA-compliant ACH files for banking transactions
- **Transaction Management**: Store, track, and process financial transactions
- **Real-time Status Updates**: Monitor pending and processed transactions
- **File Download**: Download generated ACH files directly from the interface

## Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Application**:
   ```bash
   ./start.sh
   ```
   Or manually:
   ```bash
   python app.py
   ```

3. **Access the Web Interface**: 
   Open http://localhost:5000 in your browser

## API Endpoints

### Health Check
```
GET /api/health
```
Returns system status and version information.

### Submit Transaction
```
POST /api/submit
Content-Type: application/json

{
  "routing_number": "123456789",
  "account_number": "9876543210", 
  "amount": "100.50",
  "transaction_type": "CREDIT",
  "individual_name": "John Doe",
  "individual_id": "CUST001"
}
```

### Generate ACH File
```
POST /api/generate_ach
```
Processes all pending transactions and generates an ACH file.

### Get Transactions
```
GET /api/transactions
```
Returns all transactions with their current status.

### Download ACH File
```
GET /api/download_ach/<filename>
```
Downloads a generated ACH file.

## Usage Examples

### Submit a Credit Transaction
```bash
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "routing_number": "123456789",
    "account_number": "9876543210",
    "amount": "100.50", 
    "transaction_type": "CREDIT",
    "individual_name": "John Doe",
    "individual_id": "CUST001"
  }'
```

### Generate ACH File
```bash
curl -X POST http://localhost:5000/api/generate_ach
```

## Configuration

Copy `.env.example` to `.env` and customize:

```bash
# Company Information  
COMPANY_NAME=YOUR_COMPANY
COMPANY_ID=YOUR_COMPANY_ID
ROUTING_NUMBER=YOUR_ROUTING_NUMBER

# Application Settings
SECRET_KEY=your-secret-key
DEBUG=False
PORT=5000
```

## Transaction Types

- **CREDIT**: Deposit money into an account
- **DEBIT**: Withdraw money from an account

## Testing

Run the test suite:
```bash
python test_ach_system.py
```

## Security Notes

- Change the default `SECRET_KEY` in production
- Use HTTPS in production environments
- Validate and sanitize all input data
- Implement proper authentication and authorization
- Store sensitive configuration in environment variables

## Production Deployment

For production use:

1. Set `DEBUG=False` in configuration
2. Use a production WSGI server like Gunicorn:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```
3. Use a reverse proxy (nginx) for SSL termination
4. Use a production database (PostgreSQL, MySQL)
5. Implement proper logging and monitoring

## File Structure

```
Bizpaysol/
├── app.py                 # Main Flask application
├── ach_processor.py       # ACH file generation logic
├── database.py           # Database operations
├── templates/
│   └── index.html        # Web interface
├── output/               # Generated ACH files
├── requirements.txt      # Python dependencies
├── start.sh             # Startup script
├── test_ach_system.py   # Test suite
├── .env.example         # Configuration template
└── .gitignore           # Git ignore rules
```

## ACH File Format

Generated files follow the NACHA (National Automated Clearing House Association) standard format with:

- File Header Record (Type 1)
- Batch Header Record (Type 5) 
- Entry Detail Records (Type 6)
- Batch Control Record (Type 8)
- File Control Record (Type 9)
- Filler Records as needed

## Support

For issues and questions, please check the test files for usage examples or review the API documentation above.
