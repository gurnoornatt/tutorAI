# AI Code Tutor

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-007ACC?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?style=flat-square&logo=openai)](https://openai.com/)
[![Docker](https://img.shields.io/badge/Docker-24.0-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

An intelligent coding assistant that helps students learn and improve their programming skills through real-time feedback, contextual resources, and interactive code analysis.

![AI Code Tutor Demo](docs/images/demo.gif)

## ✨ Features

- 🤖 AI-powered code analysis and feedback
- 📝 Real-time code editing and review
- 📚 Contextual programming resources
- 📋 Custom grading rubric support
- 📁 File and folder upload capabilities
- 💬 Interactive chat interface
- 🔄 Dynamic resource recommendations

## 📸 Screenshots

<div align="center">
  <img src="docs/images/code-analysis.png" alt="Code Analysis" width="400" />
  <img src="docs/images/chat-interface.png" alt="Chat Interface" width="400" />
</div>

<div align="center">
  <img src="docs/images/resources.png" alt="Resources" width="400" />
  <img src="docs/images/file-explorer.png" alt="File Explorer" width="400" />
</div>

## 🛠️ Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui Components
- Axios for API calls

### Backend
- FastAPI
- Python 3.11
- OpenAI API
- Docker
- Uvicorn

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker (optional)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-app
```

2. Install frontend dependencies:
```bash
npm install
```

3. Set up frontend environment:
```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

4. Set up backend:
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

### Running the Application

#### Development Mode

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
# In a new terminal
npm run dev
```

3. Open http://localhost:3000 in your browser

#### Using Docker

1. Build and run the backend:
```bash
cd backend
docker build -t fastapi-tutor .
docker run -p 8000:8000 -e OPENAI_API_KEY="your_api_key" fastapi-tutor
```

2. Start the frontend:
```bash
npm run dev
```

### Deployment

The backend can be deployed to various platforms:

#### Heroku
```bash
cd backend
heroku create
heroku stack:set container
heroku config:set OPENAI_API_KEY="your_api_key"
git push heroku main
```

#### AWS Elastic Beanstalk
```bash
cd backend
eb init
eb create
eb deploy
```

## Project Structure

```
my-app/
├── app/                    # Frontend Next.js application
│   ├── components/        # React components
│   ├── lib/              # Utility functions and API clients
│   └── page.tsx          # Main application page
├── backend/              # FastAPI backend
│   ├── main.py          # Main FastAPI application
│   ├── requirements.txt  # Python dependencies
│   └── test_main.py     # Backend tests
└── components/          # Shared UI components
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend framework [FastAPI](https://fastapi.tiangolo.com/)
