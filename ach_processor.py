"""
ACH File Processing Module
Handles the creation and formatting of ACH files according to NACHA standards
"""

import os
from datetime import datetime, date
import json

class ACHProcessor:
    """Handles ACH file generation and processing"""
    
    def __init__(self):
        self.company_id = "COMPANY123"  # Should be configurable
        self.company_name = "TEST COMPANY"
        self.routing_number = "123456789"  # Originating bank routing number
        
    def generate_ach_file(self, transactions):
        """Generate ACH file from transaction data"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"ach_batch_{timestamp}.txt"
        file_path = os.path.join('output', filename)
        
        with open(file_path, 'w') as f:
            # File Header Record (Record Type 1)
            f.write(self._create_file_header())
            
            # Batch Header Record (Record Type 5)
            f.write(self._create_batch_header())
            
            # Entry Detail Records (Record Type 6)
            entry_hash = 0
            total_debit = 0
            total_credit = 0
            
            for i, transaction in enumerate(transactions, 1):
                entry_record = self._create_entry_detail(transaction, i)
                f.write(entry_record)
                
                # Calculate totals for batch control
                routing_num = int(transaction['routing_number'][:8])
                entry_hash += routing_num
                
                amount = float(transaction['amount'])
                if transaction['transaction_type'].upper() == 'DEBIT':
                    total_debit += amount
                else:
                    total_credit += amount
            
            # Batch Control Record (Record Type 8)
            f.write(self._create_batch_control(len(transactions), entry_hash, total_debit, total_credit))
            
            # File Control Record (Record Type 9)
            f.write(self._create_file_control(len(transactions), entry_hash, total_debit, total_credit))
            
            # Add filler records to make file size multiple of 10
            current_records = 4 + len(transactions)  # Header + Batch Header + Entries + Batch Control + File Control
            filler_records = (10 - (current_records % 10)) % 10
            
            for _ in range(filler_records):
                f.write('9' * 94 + '\n')
        
        return filename
    
    def _create_file_header(self):
        """Create ACH file header record (Type 1)"""
        current_date = date.today()
        current_time = datetime.now()
        
        header = (
            "1"                                    # Record Type Code
            "01"                                   # Priority Code
            f"{self.routing_number:>10}"          # Immediate Destination
            f"{self.company_id:>10}"              # Immediate Origin
            f"{current_date:%y%m%d}"              # File Creation Date
            f"{current_time:%H%M}"                # File Creation Time
            "A"                                    # File ID Modifier
            "094"                                  # Record Size
            "10"                                   # Blocking Factor
            "1"                                    # Format Code
            f"{self.company_name:<23}"            # Immediate Destination Name
            f"{self.company_name:<23}"            # Immediate Origin Name
            "        "                             # Reference Code
        )
        
        return header.ljust(94) + '\n'
    
    def _create_batch_header(self):
        """Create batch header record (Type 5)"""
        current_date = date.today()
        effective_date = current_date  # Could be different
        
        header = (
            "5"                                    # Record Type Code
            "200"                                  # Service Class Code (200 = Mixed debits and credits)
            f"{self.company_name:<16}"            # Company Name
            "          "                           # Company Discretionary Data
            f"{self.company_id:<10}"              # Company Identification
            "PPD"                                  # Standard Entry Class (PPD = Prearranged Payment)
            "PAYROLL  "                           # Company Entry Description
            f"{current_date:%y%m%d}"              # Company Descriptive Date
            f"{effective_date:%y%m%d}"            # Effective Entry Date
            "   "                                  # Settlement Date
            "1"                                    # Originator Status Code
            f"{self.routing_number[:8]}"          # Originating DFI Identification
            "0000001"                             # Batch Number
        )
        
        return header.ljust(94) + '\n'
    
    def _create_entry_detail(self, transaction, sequence_number):
        """Create entry detail record (Type 6)"""
        transaction_code = "22" if transaction['transaction_type'].upper() == 'CREDIT' else "27"
        amount_cents = int(float(transaction['amount']) * 100)
        
        entry = (
            "6"                                    # Record Type Code
            f"{transaction_code}"                  # Transaction Code
            f"{transaction['routing_number'][:8]}" # Receiving DFI Identification
            f"{transaction['routing_number'][8:9]}" # Check Digit
            f"{transaction['account_number']:<17}" # DFI Account Number
            f"{amount_cents:010d}"                 # Amount
            f"{transaction.get('individual_id', ''):<15}" # Individual ID Number
            f"{transaction.get('individual_name', 'CUSTOMER'):<22}" # Individual Name
            "  "                                   # Discretionary Data
            "0"                                    # Addenda Record Indicator
            f"{sequence_number:07d}"               # Trace Number (Sequence)
        )
        
        return entry.ljust(94) + '\n'
    
    def _create_batch_control(self, entry_count, entry_hash, total_debit, total_credit):
        """Create batch control record (Type 8)"""
        service_class = "200"  # Mixed debits and credits
        
        control = (
            "8"                                    # Record Type Code
            f"{service_class}"                     # Service Class Code
            f"{entry_count:06d}"                   # Entry/Addenda Count
            f"{entry_hash:010d}"                   # Entry Hash (truncated to 10 digits)
            f"{int(total_debit * 100):012d}"       # Total Debit Entry Dollar Amount
            f"{int(total_credit * 100):012d}"      # Total Credit Entry Dollar Amount
            f"{self.company_id:<10}"               # Company Identification
            "                   "                  # Message Authentication Code
            "      "                               # Reserved
            f"{self.routing_number[:8]}"           # Originating DFI Identification
            "0000001"                              # Batch Number
        )
        
        return control.ljust(94) + '\n'
    
    def _create_file_control(self, entry_count, entry_hash, total_debit, total_credit):
        """Create file control record (Type 9)"""
        batch_count = 1
        block_count = ((4 + entry_count + 5) // 10) + (1 if (4 + entry_count + 5) % 10 else 0)
        
        control = (
            "9"                                    # Record Type Code
            f"{batch_count:06d}"                   # Batch Count
            f"{block_count:06d}"                   # Block Count
            f"{entry_count:08d}"                   # Entry/Addenda Count
            f"{entry_hash:010d}"                   # Entry Hash
            f"{int(total_debit * 100):012d}"       # Total Debit Entry Dollar Amount
            f"{int(total_credit * 100):012d}"      # Total Credit Entry Dollar Amount
            "                                      " # Reserved
        )
        
        return control.ljust(94) + '\n'