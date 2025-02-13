I want to build a Python backend using FastAPI to handle file uploads and AI feedback requests. 
Please set up a new project structure that includes:
1. A main entry point file named "main.py".
2. A requirements.txt (or pyproject.toml) for dependencies.
3. Basic instructions for running the server with uvicorn.

The backend will have two endpoints:
- POST /upload to handle file uploads
- POST /feedback to handle code + rubric analysis with OpenAI

Do not write the entire code yet. Just set up the skeleton of the project and show the file structure.

Now, please generate the content for a requirements.txt that includes:
- fastapi
- uvicorn
- openai
- python-multipart (for file uploads)
- any other libraries needed for reading and writing files, such as "pydantic" or "os" (built-in is okay, no need to install)

After that, show how to install them (e.g., pip install -r requirements.txt).
Also show how to set an environment variable for OPENAI_API_KEY in a .env file.
Do not include the actual key, just placeholders.

In "main.py", please implement the "/upload" endpoint with the following requirements:
1. It should accept POST requests containing one or more files.
2. Use FastAPI's UploadFile for handling the files.
3. Store uploaded files temporarily in a folder named "uploads" at the project root.
4. Return a JSON response confirming the upload and listing the file names.

Do not add the /feedback endpoint yet. Only create the /upload route in detail. Show me the complete code for main.py so far.

Now, in "main.py", create a second endpoint "/feedback" that:
1. Accepts a POST request with JSON containing "code", "rubric", and "userQuestion".
2. Calls the OpenAI API (using the environment variable OPENAI_API_KEY).
3. Sends a prompt instructing the AI to provide feedback according to the rubric, without giving the full solution.
4. Returns the AI's response in JSON.

Please show the entire updated "main.py" with both the /upload and /feedback routes.
Ensure you handle any exceptions properly and return error messages if something goes wrong.

Please explain how to run this FastAPI server with uvicorn, including the command (e.g., `uvicorn main:app --reload`). 
Also, provide a brief guide on how to test:
- The /upload endpoint (using something like curl or a REST client)
- The /feedback endpoint (sending a JSON body with code, rubric, and userQuestion)

Update the /upload endpoint so that after storing the files, it reads the content of each file (assuming they're small text/code files) and returns an array of file objects that includes { filename, content }. 
Do not return binary data for non-text files; just skip them or return an error if the file is too large or not text-based. 
Show me the updated code.

Please refine the system prompt in the /feedback route to emphasize:
- "You are an AI tutor. Provide feedback and hints based on the rubric, but do NOT provide the complete solution. Only highlight issues and possible improvements."
Also, add any recommended security best practices for the code we have so far (e.g., limiting file size, verifying file types, etc.). 
Do not show me the entire code again, just the updated sections and a short explanation.

Provide a short snippet (no full code) describing how the front-end can call the Python backend endpoints:
- POST /upload with a FormData object
- POST /feedback with a JSON body
Explain how the server URL might differ in production vs. development.
Do not generate any front-end code, just an explanation with short examples.

Show me how to containerize this FastAPI app using a Dockerfile and then deploy it to a platform like Heroku or AWS. 
I only need the Dockerfile content and the essential commands for deployment. Do not rewrite all the code. 

I have followed all the steps. Please give me a final checklist:
1. Ensure environment variables are set.
2. Confirm the endpoints are reachable.
3. Verify file uploads are stored correctly.
4. Test the OpenAI feedback route with a small code snippet and a rubric.
5. Provide any final best practices or performance tips.
Do not regenerate code, just give me the final summary checklist.
