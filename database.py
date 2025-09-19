"""
Database Module for ACH Processing System
Handles transaction storage and retrieval using SQLite
"""

import sqlite3
import json
from datetime import datetime
import os

class Database:
    """Database handler for ACH processing system"""
    
    def __init__(self, db_path='ach_transactions.db'):
        self.db_path = db_path
        
    def init_db(self):
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create transactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                routing_number TEXT NOT NULL,
                account_number TEXT NOT NULL,
                amount REAL NOT NULL,
                transaction_type TEXT NOT NULL,
                individual_name TEXT,
                individual_id TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP,
                raw_data TEXT
            )
        ''')
        
        # Create ach_files table to track generated files
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ach_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                transaction_count INTEGER NOT NULL,
                total_amount REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                transaction_ids TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def store_transaction(self, transaction_data):
        """Store a new transaction in the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO transactions 
            (routing_number, account_number, amount, transaction_type, 
             individual_name, individual_id, raw_data)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            transaction_data['routing_number'],
            transaction_data['account_number'],
            float(transaction_data['amount']),
            transaction_data['transaction_type'].upper(),
            transaction_data.get('individual_name', ''),
            transaction_data.get('individual_id', ''),
            json.dumps(transaction_data)
        ))
        
        transaction_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return transaction_id
    
    def get_pending_transactions(self):
        """Get all pending transactions"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM transactions 
            WHERE status = 'pending'
            ORDER BY created_at ASC
        ''')
        
        transactions = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return transactions
    
    def get_all_transactions(self):
        """Get all transactions with their status"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, routing_number, account_number, amount, transaction_type,
                   individual_name, status, created_at, processed_at
            FROM transactions 
            ORDER BY created_at DESC
        ''')
        
        transactions = []
        for row in cursor.fetchall():
            transaction = dict(row)
            # Format datetime for JSON serialization
            if transaction['created_at']:
                transaction['created_at'] = transaction['created_at']
            if transaction['processed_at']:
                transaction['processed_at'] = transaction['processed_at']
            transactions.append(transaction)
        
        conn.close()
        return transactions
    
    def mark_transactions_processed(self, transaction_ids):
        """Mark transactions as processed"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        placeholders = ','.join(['?' for _ in transaction_ids])
        cursor.execute(f'''
            UPDATE transactions 
            SET status = 'processed', processed_at = CURRENT_TIMESTAMP
            WHERE id IN ({placeholders})
        ''', transaction_ids)
        
        conn.commit()
        conn.close()
    
    def record_ach_file(self, filename, transactions):
        """Record information about a generated ACH file"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        transaction_ids = [str(t['id']) for t in transactions]
        total_amount = sum(float(t['amount']) for t in transactions)
        
        cursor.execute('''
            INSERT INTO ach_files 
            (filename, transaction_count, total_amount, transaction_ids)
            VALUES (?, ?, ?, ?)
        ''', (
            filename,
            len(transactions),
            total_amount,
            ','.join(transaction_ids)
        ))
        
        conn.commit()
        conn.close()