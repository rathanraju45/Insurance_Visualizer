# Sample Data Files for Import

This folder contains sample CSV and Excel files with **Indian context data** that can be used to test the import functionality in the Database Engine.

## 📋 Available Sample Files

### CSV Files (.csv)
- **customers_sample.csv** - 10 Indian customers with names, emails, phone numbers (+91), and addresses
- **agents_sample.csv** - 5 insurance agents with contact details
- **policies_sample.csv** - 8 insurance policies with Indian policy types and INR amounts
- **claims_sample.csv** - 5 insurance claims with INR amounts

### Excel Files (.xlsx)
- **customers_sample.xlsx** - Same as CSV format, Excel version
- **agents_sample.xlsx** - Same as CSV format, Excel version
- **policies_sample.xlsx** - Same as CSV format, Excel version
- **claims_sample.xlsx** - Same as CSV format, Excel version

### Data Characteristics
- **Indian Names**: Arjun Sharma, Priya Patel, Vikram Reddy, etc.
- **Indian Cities**: Bangalore, Mumbai, Hyderabad, Chennai, Kolkata, Delhi, Pune, Kochi, Lucknow, Jaipur
- **Phone Numbers**: +91 format (Indian country code)
- **Currency**: All amounts in INR (Indian Rupees)
- **Policy Types**: Term Life, Health, Motor, Home, Travel, Personal Accident, Critical Illness, ULIP

## Import Instructions

1. **Select a table** in the Database Engine
2. **Click "📤 Import CSV/Excel"** button in the table header
3. **Choose a CSV or Excel file** (.csv, .xls, .xlsx)
4. The system will automatically:
   - Parse the file
   - Match columns with the table schema
   - Insert new rows or update existing ones (based on Primary Key)
   - Show a summary of imported, updated, and skipped rows

## File Format Requirements

### CSV Format
- First row should contain column headers matching your table column names
- Column names are case-sensitive
- Dates should be in ISO format (YYYY-MM-DD) or (YYYY-MM-DD HH:MM:SS)
- Example:
```csv
customer_id,name,email,phone,date_of_birth
1,John Doe,john@example.com,555-1234,1990-05-15
2,Jane Smith,jane@example.com,555-5678,1985-08-22
```

### Excel Format
- First row should contain column headers
- All data should be in the first sheet
- Dates will be automatically converted

## Import Behavior

### Insert vs Update
- If a row with the same **Primary Key** exists, it will be **updated**
- If no matching Primary Key is found, a new row will be **inserted**
- If no Primary Key is defined, all rows will be inserted as new

### Skipped Rows
Rows may be skipped if:
- No valid columns match the table schema
- Data validation fails
- Database constraints are violated (e.g., duplicate unique keys)

### Column Matching
- Only columns that exist in the target table will be imported
- Extra columns in the file will be ignored
- Missing columns will use default values or NULL (if allowed)

## Tips

1. **Export existing data first** to see the correct format
2. **Include the Primary Key** if you want to update existing rows
3. **Omit auto-increment columns** (they'll be generated automatically)
4. **Check data types** - strings should be text, numbers should be numeric
5. **Date formats** - use YYYY-MM-DD for dates, YYYY-MM-DD HH:MM:SS for datetime

## Example Files Included

- `customers_sample.csv` - Sample customer data
- `agents_sample.csv` - Sample insurance agent data
- `policies_sample.csv` - Sample policy data
- `claims_sample.csv` - Sample claims data

You can use these files as templates for your own imports!
