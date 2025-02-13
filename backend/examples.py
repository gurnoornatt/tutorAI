import requests

def test_single_file_upload():
    """Example: Upload a single file"""
    with open('test.py', 'rb') as f:
        response = requests.post(
            'http://localhost:8000/upload',
            files={'files': ('test.py', f, 'text/plain')}
        )
        print("Single file upload response:", response.json())

def test_multiple_files_upload():
    """Example: Upload multiple files"""
    # Create test files
    with open('test1.txt', 'w') as f:
        f.write('Hello from file 1')
    with open('test2.txt', 'w') as f:
        f.write('Hello from file 2')

    # Upload files
    files = [
        ('files', ('test1.txt', open('test1.txt', 'rb'), 'text/plain')),
        ('files', ('test2.txt', open('test2.txt', 'rb'), 'text/plain'))
    ]
    
    try:
        response = requests.post('http://localhost:8000/upload', files=files)
        print("Multiple files upload response:", response.json())
    finally:
        # Clean up: close file handles
        for _, (_, f, _) in files:
            f.close()

def test_feedback_endpoint():
    """Example: Get AI feedback on code"""
    test_data = {
        "code": "def greet(name):\n    print('Hello, ' + name)",
        "rubric": "Function should use f-strings and include a docstring",
        "userQuestion": "How can I make this code more Pythonic?"
    }
    
    response = requests.post(
        'http://localhost:8000/feedback',
        json=test_data
    )
    print("Feedback response:", response.json())

if __name__ == "__main__":
    print("Running example API calls...")
    print("\n1. Testing single file upload:")
    test_single_file_upload()
    
    print("\n2. Testing multiple files upload:")
    test_multiple_files_upload()
    
    print("\n3. Testing feedback endpoint:")
    test_feedback_endpoint() 