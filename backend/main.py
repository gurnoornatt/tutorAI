from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import shutil
from pydantic import BaseModel
from dotenv import load_dotenv, find_dotenv
from openai import OpenAI
import mimetypes

# Load environment variables with debug info
env_path = find_dotenv()
print(f"Loading .env from: {env_path}")
load_dotenv(env_path)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Debug: Print API key prefix (safely)
api_key = os.getenv("OPENAI_API_KEY", "")
if api_key:
    print(f"API key prefix: {api_key[:7]}...")
    print(f"API key length: {len(api_key)}")
else:
    print("No API key found in environment variables")

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Constants for security
MAX_FILE_SIZE_MB = 5
MAX_FILES_PER_REQUEST = 10
ALLOWED_EXTENSIONS = {
    '.txt', '.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', 
    '.yml', '.yaml', '.md', '.rst', '.ini', '.conf', '.sh'
}

class FeedbackRequest(BaseModel):
    code: str
    rubric: str
    userQuestion: str

def is_text_file(filename: str) -> bool:
    """
    Check if a file is likely to be a text file based on its mime type and extension.
    """
    # Common text file extensions
    text_extensions = {
        '.txt', '.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', 
        '.yml', '.yaml', '.md', '.rst', '.ini', '.conf', '.sh', '.bash', '.zsh',
        '.sql', '.c', '.cpp', '.h', '.hpp', '.java', '.rb', '.php', '.go', '.rs',
        '.swift', '.kt', '.kts', '.scala', '.pl', '.pm', '.r', '.dart', '.lua'
    }
    
    # Check file extension
    ext = os.path.splitext(filename)[1].lower()
    if ext in text_extensions:
        return True
    
    # Check mime type
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type and mime_type.startswith('text/')

def is_file_too_large(file_path: str, max_size_mb: int = MAX_FILE_SIZE_MB) -> bool:
    """
    Check if a file is larger than the specified size in megabytes.
    """
    max_size_bytes = max_size_mb * 1024 * 1024  # Convert MB to bytes
    return os.path.getsize(file_path) > max_size_bytes

def is_safe_file_path(filename: str) -> bool:
    """
    Verify that the file path is safe and doesn't contain directory traversal attempts.
    """
    return os.path.basename(filename) == filename

def is_allowed_file_type(filename: str) -> bool:
    """
    Check if the file extension is in the allowed list.
    """
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

@app.post("/upload")
async def upload_files(files: List[UploadFile]):
    """
    Upload one or more files to the server.
    Only processes text files and returns their content.
    Includes security checks for file size, type, and count.
    """
    if len(files) > MAX_FILES_PER_REQUEST:
        raise HTTPException(
            status_code=400,
            detail=f"Too many files. Maximum {MAX_FILES_PER_REQUEST} files allowed per request"
        )

    try:
        uploaded_files = []
        for file in files:
            # Security checks
            if not is_safe_file_path(file.filename):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid filename"
                )
            
            if not is_allowed_file_type(file.filename):
                uploaded_files.append({
                    "filename": file.filename,
                    "content": "File type not allowed",
                    "status": "error"
                })
                continue

            # Generate safe filename to prevent path traversal
            safe_filename = os.path.basename(file.filename)
            file_path = os.path.join(UPLOAD_DIR, safe_filename)
            
            # Save file temporarily
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            try:
                # Skip if file is too large
                if is_file_too_large(file_path):
                    uploaded_files.append({
                        "filename": safe_filename,
                        "size": os.path.getsize(file_path),
                        "content": "File too large to process",
                        "status": "skipped"
                    })
                    continue
                
                # Process only if it's a text file
                if is_text_file(safe_filename):
                    try:
                        with open(file_path, "r", encoding='utf-8') as f:
                            content = f.read()
                        uploaded_files.append({
                            "filename": safe_filename,
                            "size": os.path.getsize(file_path),
                            "content": content,
                            "status": "success"
                        })
                    except UnicodeDecodeError:
                        uploaded_files.append({
                            "filename": safe_filename,
                            "size": os.path.getsize(file_path),
                            "content": "File appears to be binary or encoded in an unsupported format",
                            "status": "error"
                        })
                else:
                    uploaded_files.append({
                        "filename": safe_filename,
                        "size": os.path.getsize(file_path),
                        "content": "Not a supported text file",
                        "status": "skipped"
                    })
            finally:
                # Clean up: remove the temporary file
                if os.path.exists(file_path):
                    os.remove(file_path)
        
        return {
            "status": "success",
            "message": f"Processed {len(uploaded_files)} files",
            "files": uploaded_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/feedback")
async def get_feedback(request: FeedbackRequest):
    try:
        if not client.api_key:
            print("OpenAI API key not found")
            raise HTTPException(
                status_code=500,
                detail="OpenAI API key not configured"
            )

        print(f"Making request to OpenAI with API key prefix: {client.api_key[:7]}...")

        # Enhanced system prompt for better tutoring
        system_prompt = """You are an AI teaching assistant focused on helping students learn and improve their coding skills. Your role is to:

        1. Analyze code based on the provided rubric criteria
        2. Provide constructive feedback that encourages learning
        3. Highlight specific areas for improvement
        4. Give hints and suggestions that guide students toward solutions
        5. NEVER provide complete solutions or direct code fixes
        6. Explain concepts and best practices related to the issues found
        7. Use examples sparingly and only to illustrate concepts
        8. Encourage students to think critically about their code
        9. Reference specific parts of the rubric in your feedback
        10. Maintain a supportive and encouraging tone

        Remember: Your goal is to help students learn and understand, not to solve problems for them.
        """

        # Enhanced user prompt with better structure
        user_prompt = f"""Please analyze this code and provide educational feedback:

        CODE TO REVIEW:
        ```
        {request.code}
        ```

        RUBRIC CRITERIA:
        {request.rubric}

        STUDENT'S QUESTION:
        {request.userQuestion}

        Please structure your response to:
        1. Acknowledge the student's question
        2. Reference specific rubric criteria
        3. Highlight areas for improvement
        4. Provide conceptual hints and suggestions
        5. Include learning resources or documentation references when relevant
        6. Encourage the student to think about specific improvements
        7. DO NOT provide direct solutions or complete code fixes
        """

        try:
            print("Creating chat completion...")
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            print("Chat completion successful")

            return {
                "status": "success",
                "feedback": response.choices[0].message.content
            }

        except Exception as e:
            print(f"Error calling OpenAI API: {str(e)}")
            print(f"Error type: {type(e)}")
            print(f"Error details: {e.__dict__ if hasattr(e, '__dict__') else 'No details available'}")
            raise HTTPException(
                status_code=500,
                detail=f"OpenAI API error: {str(e)}"
            )

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        print(f"Error type: {type(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
