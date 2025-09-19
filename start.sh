#!/bin/bash

# Start the ACH Processing System

echo "Starting ACH Processing System..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
mkdir -p output
mkdir -p templates

# Start the application
echo "Starting Flask application..."
python app.py