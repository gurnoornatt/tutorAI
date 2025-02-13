from fastapi.testclient import TestClient
import os
from main import app, UPLOAD_DIR
import pytest
from unittest.mock import patch, MagicMock

client = TestClient(app)

@pytest.fixture(autouse=True)
def cleanup():
    """Clean up the uploads directory before and after each test"""
    # Clean before test
    if os.path.exists(UPLOAD_DIR):
        for file in os.listdir(UPLOAD_DIR):
            os.remove(os.path.join(UPLOAD_DIR, file))
    
    yield  # Run test
    
    # Clean after test
    if os.path.exists(UPLOAD_DIR):
        for file in os.listdir(UPLOAD_DIR):
            os.remove(os.path.join(UPLOAD_DIR, file))

def create_test_file(filename: str, content: str) -> str:
    """Helper function to create a test file"""
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
    return filename

def create_binary_file(filename: str, size_bytes: int = 1024) -> str:
    """Helper function to create a binary test file"""
    with open(filename, "wb") as f:
        f.write(os.urandom(size_bytes))
    return filename

# Upload endpoint tests
def test_upload_single_text_file():
    """Test uploading a single text file"""
    filename = create_test_file("test.py", 'print("Hello, World!")')
    
    try:
        with open(filename, "rb") as f:
            response = client.post(
                "/upload",
                files={"files": (filename, f, "text/plain")}
            )
        
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        assert len(response.json()["files"]) == 1
        assert response.json()["files"][0]["filename"] == "test.py"
        assert response.json()["files"][0]["content"] == 'print("Hello, World!")'
        assert response.json()["files"][0]["status"] == "success"
    finally:
        if os.path.exists(filename):
            os.remove(filename)

def test_upload_multiple_files():
    """Test uploading multiple files at once"""
    files = [
        ("test1.py", 'print("File 1")'),
        ("test2.txt", "Hello from file 2")
    ]
    
    created_files = [create_test_file(name, content) for name, content in files]
    
    try:
        # Create files dict for upload
        with open(created_files[0], "rb") as f1, open(created_files[1], "rb") as f2:
            response = client.post(
                "/upload",
                files=[
                    ("files", (created_files[0], f1, "text/plain")),
                    ("files", (created_files[1], f2, "text/plain"))
                ]
            )
        
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        assert len(response.json()["files"]) == 2
        
        # Verify each file was processed correctly
        for i, (filename, content) in enumerate(files):
            assert response.json()["files"][i]["filename"] == filename
            assert response.json()["files"][i]["content"] == content
            assert response.json()["files"][i]["status"] == "success"
    
    finally:
        # Clean up test files
        for file in created_files:
            if os.path.exists(file):
                os.remove(file)

def test_upload_binary_file():
    """Test uploading a binary file"""
    filename = create_binary_file("test.bin")
    
    try:
        with open(filename, "rb") as f:
            response = client.post(
                "/upload",
                files={"files": (filename, f, "application/octet-stream")}
            )
        
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        assert len(response.json()["files"]) == 1
        assert response.json()["files"][0]["filename"] == "test.bin"
        assert response.json()["files"][0]["status"] == "skipped"
        assert "Not a supported text file" in response.json()["files"][0]["content"]
    
    finally:
        if os.path.exists(filename):
            os.remove(filename)

def test_upload_large_file():
    """Test uploading a file that exceeds size limit"""
    # Create a 6MB file (above the 5MB limit)
    filename = create_binary_file("large.txt", 6 * 1024 * 1024)
    
    try:
        with open(filename, "rb") as f:
            response = client.post(
                "/upload",
                files={"files": (filename, f, "text/plain")}
            )
        
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        assert len(response.json()["files"]) == 1
        assert response.json()["files"][0]["filename"] == "large.txt"
        assert response.json()["files"][0]["status"] == "skipped"
        assert "File too large to process" in response.json()["files"][0]["content"]
    
    finally:
        if os.path.exists(filename):
            os.remove(filename)

def test_upload_no_files():
    """Test uploading with no files"""
    response = client.post("/upload", files={})
    assert response.status_code == 422  # Validation error

# Feedback endpoint tests
@pytest.fixture
def mock_openai():
    """Mock OpenAI API responses"""
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content="Test feedback response"))
    ]
    
    with patch('openai.ChatCompletion.create', return_value=mock_response):
        yield

def test_feedback_valid_request(mock_openai):
    """Test feedback endpoint with valid request"""
    test_data = {
        "code": "def add(a, b):\n    return a + b",
        "rubric": "Function should include docstring and type hints",
        "userQuestion": "How can I improve this code?"
    }
    
    response = client.post("/feedback", json=test_data)
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert "feedback" in response.json()
    assert isinstance(response.json()["feedback"], str)

def test_feedback_missing_fields():
    """Test feedback endpoint with missing required fields"""
    test_data = {
        "code": "def add(a, b):\n    return a + b"
        # Missing rubric and userQuestion
    }
    
    response = client.post("/feedback", json=test_data)
    assert response.status_code == 422  # Validation error

def test_feedback_empty_fields(mock_openai):
    """Test feedback endpoint with empty fields"""
    test_data = {
        "code": "",
        "rubric": "",
        "userQuestion": ""
    }
    
    response = client.post("/feedback", json=test_data)
    assert response.status_code == 200  # Should still work, but might give feedback about empty input

@pytest.mark.skipif(not os.getenv("OPENAI_API_KEY"), reason="OpenAI API key not configured")
def test_feedback_real_api():
    """Test feedback endpoint with real OpenAI API (only runs if API key is configured)"""
    test_data = {
        "code": "def greet(name):\n    print('Hello, ' + name)",
        "rubric": "Function should use f-strings and include a docstring",
        "userQuestion": "How can I make this code more Pythonic?"
    }
    
    response = client.post("/feedback", json=test_data)
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert "feedback" in response.json()
    assert len(response.json()["feedback"]) > 0 