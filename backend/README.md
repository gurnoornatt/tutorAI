# AI Teaching Assistant Backend

This is the backend service for the AI Teaching Assistant application. It's built using FastAPI and provides endpoints for file uploads and AI-powered code feedback.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Environment Configuration:
- Copy `.env.example` to `.env`
- Add your OpenAI API key to the `.env` file

## Running the Server

Start the server with:
```bash
uvicorn main:app --reload
```

The server will run on `http://localhost:8000` by default.

## API Endpoints

### 1. File Upload
- **Endpoint**: `POST /upload`
- **Purpose**: Handles code file uploads
- **Request**: Multipart form data with files
- **Response**: JSON with uploaded files and their contents
```json
{
    "status": "success",
    "files": [
        {
            "filename": "example.py",
            "content": "..."
        }
    ]
}
```

### 2. AI Feedback
- **Endpoint**: `POST /feedback`
- **Purpose**: Provides AI-powered code feedback based on rubric
- **Request Body**:
```json
{
    "code": "string",
    "rubric": "string",
    "userQuestion": "string"
}
```
- **Response**: JSON with AI feedback
```json
{
    "status": "success",
    "feedback": "..."
}
```

## Security Features

1. CORS configuration for frontend integration
2. Environment variable management
3. Error handling for file uploads and API calls
4. Text-only file content processing

## Integration with Frontend

The backend is configured to work with the Next.js frontend running on `http://localhost:3000`. Update the CORS settings in `main.py` if your frontend runs on a different port or domain. 