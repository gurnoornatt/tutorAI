import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface FeedbackResponse {
  status: string;
  feedback: string;
}

export interface UploadResponse {
  status: string;
  message: string;
  files: Array<{
    filename: string;
    content: string;
    size: number;
    status: 'success' | 'error' | 'skipped';
  }>;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFiles = async (files: File[]): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    const { data } = await api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const getFeedback = async (
  code: string,
  rubric: string,
  userQuestion: string
): Promise<FeedbackResponse> => {
  try {
    const { data } = await api.post<FeedbackResponse>('/feedback', {
      code,
      rubric,
      userQuestion,
    });

    return data;
  } catch (error) {
    console.error('Feedback error:', error);
    throw error;
  }
};

export default api; 