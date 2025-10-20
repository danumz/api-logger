# Question Package Upload System

A comprehensive question package upload system built with Express.js and Sequelize ORM, supporting various content types including images, equations, tables, and graphs.

## Features

- **Question Package Management**: Create, read, update, and delete question packages
- **Multiple Content Types**: Support for text, images, equations (LaTeX), tables, graphs, and mixed content
- **Media Management**: Upload and manage media files (images, videos, documents)
- **RESTful API**: Well-structured API endpoints with proper validation
- **Database**: Sequelize ORM with support for SQLite, PostgreSQL, MySQL
- **Frontend Example**: Basic web interface for testing the API

## Tech Stack

- **Backend**: Express.js, TypeScript
- **ORM**: Sequelize
- **Database**: SQLite (default), PostgreSQL, MySQL
- **File Upload**: Multer
- **Validation**: Joi, express-validator
- **Frontend**: Vanilla JavaScript, HTML, CSS

## Installation

1. Clone the repository:
```bash
git clone https://github.com/danumz/api-logger.git
cd api-logger
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=3000
NODE_ENV=development
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=*
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Question Packages

- `POST /api/question-packages` - Create a new question package
- `GET /api/question-packages` - Get all question packages
- `GET /api/question-packages/:id` - Get a specific question package
- `PUT /api/question-packages/:id` - Update a question package
- `DELETE /api/question-packages/:id` - Delete a question package

### Questions

- `POST /api/questions/package/:packageId` - Create a question in a package
- `GET /api/questions/package/:packageId` - Get questions from a package
- `GET /api/questions/:id` - Get a specific question
- `GET /api/questions/content-type/:contentType` - Get questions by content type
- `PUT /api/questions/:id` - Update a question
- `DELETE /api/questions/:id` - Delete a question

### Media

- `POST /api/media` - Upload a media file
- `GET /api/media` - Get all media files
- `GET /api/media/:id` - Get a specific media file
- `GET /api/media/:id/download` - Download a media file
- `DELETE /api/media/:id` - Delete a media file

## API Usage Examples

### Create a Question Package

```bash
curl -X POST http://localhost:3000/api/question-packages \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Math Quiz",
    "description": "Basic algebra questions",
    "questions": [
      {
        "text": "What is 2+2?",
        "contentType": "text",
        "content": {
          "type": "text",
          "text": "Simple addition"
        },
        "correctAnswer": "4",
        "difficulty": "easy",
        "tags": ["math", "basic"]
      }
    ]
  }'
```

### Upload Media

```bash
curl -X POST http://localhost:3000/api/media \
  -F "file=@image.png" \
  -F "questionId=1"
```

### Create Question with Image

```json
{
  "text": "What shape is shown in the image?",
  "contentType": "image",
  "content": {
    "type": "image",
    "imageId": 1
  },
  "correctAnswer": "circle"
}
```

### Create Question with Equation

```json
{
  "text": "Solve the equation",
  "contentType": "equation",
  "content": {
    "type": "equation",
    "equation": "x^2 + 2x + 1 = 0"
  },
  "correctAnswer": "x = -1"
}
```

### Create Question with Table

```json
{
  "text": "Analyze the following data",
  "contentType": "table",
  "content": {
    "type": "table",
    "tableData": {
      "headers": ["Name", "Age", "Score"],
      "rows": [
        ["Alice", "25", "95"],
        ["Bob", "30", "87"]
      ]
    }
  }
}
```

### Create Question with Graph

```json
{
  "text": "What trend does the graph show?",
  "contentType": "graph",
  "content": {
    "type": "graph",
    "graphData": {
      "type": "line",
      "labels": ["Jan", "Feb", "Mar"],
      "datasets": [
        {
          "label": "Sales",
          "data": [100, 150, 200],
          "borderColor": "blue"
        }
      ]
    }
  }
}
```

## Database Schema

### QuestionPackage
- `id` (INTEGER, Primary Key)
- `title` (STRING, Required)
- `description` (TEXT)
- `createdAt` (DATE)
- `updatedAt` (DATE)

### Question
- `id` (INTEGER, Primary Key)
- `packageId` (INTEGER, Foreign Key)
- `text` (TEXT, Required)
- `contentType` (STRING, Required)
- `content` (JSON, Required)
- `options` (JSON)
- `correctAnswer` (TEXT)
- `explanation` (TEXT)
- `difficulty` (STRING)
- `tags` (JSON)
- `createdAt` (DATE)
- `updatedAt` (DATE)

### Media
- `id` (INTEGER, Primary Key)
- `filename` (STRING, Required)
- `originalName` (STRING, Required)
- `mimeType` (STRING, Required)
- `size` (INTEGER, Required)
- `path` (STRING, Required)
- `mediaType` (STRING, Required)
- `questionId` (INTEGER, Foreign Key)
- `createdAt` (DATE)
- `updatedAt` (DATE)

## Content Types

The system supports the following content types:

1. **Text**: Simple text content
2. **Image**: Image with reference to uploaded media
3. **Equation**: Mathematical equations in LaTeX format
4. **Table**: Structured tabular data
5. **Graph**: Chart/graph data (line, bar, pie, scatter)
6. **Mixed**: Combination of text, images, and equations

## Frontend Example

Access the frontend example at `http://localhost:3000/frontend`

Features:
- Upload question packages
- View all packages
- Upload media files
- Interactive forms for different content types

## Project Structure

```
api-logger/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── models/
│   │   ├── QuestionPackage.ts
│   │   ├── Question.ts
│   │   ├── Media.ts
│   │   └── index.ts
│   ├── controllers/
│   │   ├── questionPackageController.ts
│   │   ├── questionController.ts
│   │   └── mediaController.ts
│   ├── routes/
│   │   ├── questionPackageRoutes.ts
│   │   ├── questionRoutes.ts
│   │   ├── mediaRoutes.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── upload.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── utils/
│   │   └── contentHandlers.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── api.js
│   └── app.js
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Security Features

- File type validation for uploads
- File size limits
- SQL injection prevention (via Sequelize)
- Request validation
- Error handling middleware
- CORS configuration

## Development

### Build TypeScript

```bash
npm run build
```

### Watch mode

```bash
npm run dev
```

## Database Migration

To use PostgreSQL or MySQL instead of SQLite:

1. Install the appropriate database driver:
```bash
npm install pg pg-hstore  # PostgreSQL
# or
npm install mysql2  # MySQL
```

2. Update `.env`:
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=question_db
DB_USER=your_username
DB_PASSWORD=your_password
```

## License

ISC

## Author

Your Name

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
