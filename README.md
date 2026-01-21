# SQL Visualization Frontend

A beautiful, interactive frontend for visualizing SQL query execution flow and data transformations.

## Features

- **SQL Editor**: Write CREATE TABLE, INSERT, and SELECT statements with Monaco Editor
- **ER Diagrams**: Automatic entity-relationship diagram generation for multi-table schemas
- **Query Visualization**: Step-by-step visualization of SQL query execution
- **Data Flow**: See how data transforms at each stage (FROM → WHERE → SELECT → etc.)
- **Animated Transitions**: Smooth animations for data flow visualization

## Tech Stack

- **React 19** with TypeScript
- **Tailwind CSS** + shadcn/ui for styling
- **Monaco Editor** for SQL editing
- **React Flow** for ER diagrams
- **TanStack Table** for data tables
- **TanStack React Query** for API state management
- **Zustand** for client state
- **Motion** (Framer Motion) for animations

## Installation

### 1. Install Dependencies

```bash
npm install @xyflow/react @monaco-editor/react @tanstack/react-table @tanstack/react-query zustand motion axios
```

Or with all at once:

```bash
npm install @xyflow/react @monaco-editor/react @tanstack/react-table @tanstack/react-query zustand motion axios
```

### 2. Start the Backend

Make sure the backend server is running on `http://localhost:3000`. See the backend documentation for setup instructions.

### 3. Start the Frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Usage Flow

### Step 1: Create Your Database

Write SQL to create tables and insert sample data:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  department_id INTEGER
);

CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  budget REAL
);

INSERT INTO users VALUES (1, 'Alice', 30, 1), (2, 'Bob', 25, 2);
INSERT INTO departments VALUES (1, 'Engineering', 500000);
```

### Step 2: View Schema

- See your table structure
- View ER diagram for multi-table relationships
- Browse table data

### Step 3: Write Query

Write a SELECT query to visualize:

```sql
SELECT u.name, u.age, d.name as department
FROM users u
JOIN departments d ON u.department_id = d.id
WHERE u.age > 25
ORDER BY u.age DESC;
```

### Step 4: Visualize Execution

- Step through the query execution order
- See which rows are filtered at each stage
- Understand why rows were excluded
- View the final result

## Project Structure

```
src/
├── api/
│   ├── client.ts       # API client with Axios
│   └── types.ts        # TypeScript types
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── views/          # Main view components
│   ├── DataFlowVisualizer.tsx
│   ├── DataTable.tsx
│   ├── ERDiagram.tsx
│   ├── ExecutionStepper.tsx
│   ├── Layout.tsx
│   └── SqlEditor.tsx
├── hooks/
│   └── useApi.ts       # React Query hooks
├── lib/
│   └── utils.ts        # Utility functions
├── store/
│   └── index.ts        # Zustand store
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

## Keyboard Shortcuts

- `Ctrl+Enter` - Execute SQL / Visualize query

## API Requirements

This frontend requires the SQL Visualization backend API running at `http://localhost:3000`.

Key endpoints used:
- `POST /api/sessions` - Create session
- `POST /api/sql/execute-multiple` - Execute SQL statements
- `GET /api/sql/tables/:sessionId` - Get tables and ER diagram
- `POST /api/sql/visualize` - Visualize query execution

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## License

MIT
