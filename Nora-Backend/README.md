# Nora Backend API

**Backend only.** This folder contains the Node.js API server for Nora. The UI runs in a separate project: **Nora/**.

- **Nora-Backend/** (this folder): backend API — runs on port **8080**
- **Nora/**: frontend — runs on port **3000**

Do not mix frontend and backend code; keep them in these two separate folders.

## Features

- RESTful API endpoints for all frontend features
- CORS enabled for frontend on port 3000
- All responses in array format (even single items)
- Modular structure (routes, controllers, data)
- Ready for AWS/database integration

## Prerequisites

- Node.js 18+ (ES modules support)
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on **port 8080** by default.

You can override the port using the `PORT` environment variable:

```bash
PORT=3001 npm start
```

## Health Check

Once the server is running, check health:

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "ok",
  "message": "Nora Backend API is running"
}
```

## Folder Structure

```
Nora-Backend/
├── server.js                 # Main server entry point
├── package.json              # Dependencies and scripts
├── data/
│   └── mockData.js          # Mock data for all entities
├── controllers/
│   ├── expensesController.js
│   ├── categoriesController.js
│   ├── budgetController.js
│   ├── statementsController.js
│   ├── contactsController.js
│   ├── invoicesController.js
│   ├── payableSummaryController.js
│   ├── statsController.js
│   ├── chartsController.js
│   └── reportsController.js
├── routes/
│   ├── expenses.js
│   ├── categories.js
│   ├── budget.js
│   ├── statements.js
│   ├── contacts.js
│   ├── invoices.js
│   ├── payable-summary.js
│   ├── stats.js
│   ├── charts.js
│   └── reports.js
├── docs/                     # API documentation (organized)
│   ├── README.md
│   ├── API.md                # Overview & quick reference
│   ├── API-Invoices.md
│   ├── API-Expenses.md
│   ├── API-Contacts.md
│   ├── API-Categories.md
│   ├── API-Budget.md
│   ├── API-Statements.md
│   ├── API-PayableSummary.md
│   ├── API-Stats.md
│   ├── API-Charts.md
│   └── API-Reports.md
├── README.md                 # This file
└── API.md                    # API documentation (legacy)
```

## API Endpoints

All endpoints return data in **array format**. See `docs/API.md` and `docs/API-Invoices.md` for detailed request/response documentation.

### Main Endpoints

- `GET /expenses` - List expenses (with filters)
- `POST /expenses` - Create expense
- `PATCH /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

- `GET /categories` - List categories

- `GET /budget` - Get budget overview

- `GET /statements` - List statements (includes `transactionsList` per statement)
- `GET /statements/:id/transactions` - Get transactions for a statement
- `POST /statements/upload` - Upload statement (multipart/form-data)

- `GET /contacts` - List contacts

- `GET /invoices` - List invoices
- `POST /invoices` - Create invoice
- `PATCH /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice

- `GET /payable-summary` - Get payable/owing summary (overdue invoices, bills; for dashboard)

- `GET /stats` - Dashboard stats (totalIncome=0, expenses, net profit, changes)
- `GET /charts?range=12|24` - Chart data (income/expense and category)
- `GET /reports` - Full reports data (stats, trends, insights, heatmap)

- `POST /contacts` - Create contact
- `PUT /contacts` - Update contact (body: `{ id, ...updates }`)
- `DELETE /contacts?id=` - Delete contact

## Running with the frontend

1. Start the backend (this folder): `npm start` → http://localhost:8080  
2. Start the frontend (Nora/): `npm run dev` → http://localhost:3000  
3. Use the app at http://localhost:3000; it will call the API on port 8080.

## CORS Configuration

The server is configured to accept requests from `http://localhost:3000` (frontend).

To change the allowed origin, modify `server.js`:

```javascript
app.use(cors({
  origin: 'http://localhost:3000', // Change this
  credentials: true
}));
```

## Data Storage

Currently, data is stored in-memory (mock data). This means:

- Data resets on server restart
- Changes are not persisted

### Future Integration

To integrate with AWS or a database:

1. **Replace mock data access** in controllers:
   - Instead of `import { expenses } from '../data/mockData.js'`
   - Use database queries or AWS SDK calls

2. **Example for AWS DynamoDB**:
   ```javascript
   import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
   import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
   
   const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
   const result = await client.send(new ScanCommand({ TableName: 'expenses' }));
   ```

3. **Example for PostgreSQL**:
   ```javascript
   import { Pool } from 'pg';
   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   const result = await pool.query('SELECT * FROM expenses');
   ```

4. **Environment variables**:
   - Create `.env` file for sensitive credentials
   - Use `dotenv` package to load environment variables
   - Never commit `.env` to version control

## Response Format

All API responses follow this pattern:

```json
{
  "expenses": [ ... ]  // Array format
}
```

or

```json
{
  "payableSummary": [ ... ]  // Array format
}
```

Even single items are wrapped in arrays to match frontend expectations.

## Error Handling

The server includes error handling middleware:

- 404 for unknown routes
- 500 for server errors
- Error messages included in response

Example error response:
```json
{
  "error": "Expense not found"
}
```

## Development Tips

1. **Testing endpoints**: Use tools like Postman, Insomnia, or `curl`
2. **Logging**: Add `console.log()` in controllers for debugging
3. **Validation**: Consider adding input validation middleware (e.g., `express-validator`)
4. **Rate limiting**: Add rate limiting for production (e.g., `express-rate-limit`)

## License

ISC
