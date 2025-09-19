#!/usr/bin/env python3
"""
ACH Processing System - Main Application
API and management GUI for processing ACH files
"""

from flask import Flask, request, jsonify, render_template, send_file
from datetime import datetime, date
import json
import os
import logging
from ach_processor import ACHProcessor
from database import Database

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database and ACH processor
db = Database()
ach_processor = ACHProcessor()

@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('index.html')

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/submit', methods=['POST'])
def submit_transaction():
    """Submit transaction data for ACH processing"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['routing_number', 'account_number', 'amount', 'transaction_type']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'missing_fields': missing_fields
            }), 400
        
        # Process and store transaction
        transaction_id = db.store_transaction(data)
        
        logger.info(f"Transaction submitted: {transaction_id}")
        
        return jsonify({
            'success': True,
            'transaction_id': transaction_id,
            'message': 'Transaction submitted successfully'
        })
        
    except Exception as e:
        logger.error(f"Error submitting transaction: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/generate_ach', methods=['POST'])
def generate_ach_file():
    """Generate ACH file from stored transactions"""
    try:
        # Get pending transactions
        transactions = db.get_pending_transactions()
        
        if not transactions:
            return jsonify({
                'error': 'No pending transactions found'
            }), 400
        
        # Generate ACH file
        ach_file_path = ach_processor.generate_ach_file(transactions)
        
        # Update transaction status
        transaction_ids = [t['id'] for t in transactions]
        db.mark_transactions_processed(transaction_ids)
        
        logger.info(f"ACH file generated: {ach_file_path}")
        
        return jsonify({
            'success': True,
            'file_path': ach_file_path,
            'transaction_count': len(transactions)
        })
        
    except Exception as e:
        logger.error(f"Error generating ACH file: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/download_ach/<filename>')
def download_ach_file(filename):
    """Download generated ACH file"""
    try:
        file_path = os.path.join('output', filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
            
    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/transactions')
def get_transactions():
    """Get list of all transactions"""
    try:
        transactions = db.get_all_transactions()
        return jsonify(transactions)
        
    except Exception as e:
        logger.error(f"Error retrieving transactions: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('output', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    
    # Initialize database
    db.init_db()
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)