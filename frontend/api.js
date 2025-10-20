// API Configuration
const API_BASE_URL = '/api';

// API Service
const API = {
    // Question Packages
    async createQuestionPackage(data) {
        const response = await fetch(`${API_BASE_URL}/question-packages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return this.handleResponse(response);
    },

    async getQuestionPackages() {
        const response = await fetch(`${API_BASE_URL}/question-packages`);
        return this.handleResponse(response);
    },

    async getQuestionPackageById(id) {
        const response = await fetch(`${API_BASE_URL}/question-packages/${id}`);
        return this.handleResponse(response);
    },

    async updateQuestionPackage(id, data) {
        const response = await fetch(`${API_BASE_URL}/question-packages/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return this.handleResponse(response);
    },

    async deleteQuestionPackage(id) {
        const response = await fetch(`${API_BASE_URL}/question-packages/${id}`, {
            method: 'DELETE',
        });
        return this.handleResponse(response);
    },

    // Questions
    async createQuestion(packageId, data) {
        const response = await fetch(`${API_BASE_URL}/questions/package/${packageId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return this.handleResponse(response);
    },

    async getQuestions(packageId) {
        const response = await fetch(`${API_BASE_URL}/questions/package/${packageId}`);
        return this.handleResponse(response);
    },

    async getQuestionById(id) {
        const response = await fetch(`${API_BASE_URL}/questions/${id}`);
        return this.handleResponse(response);
    },

    async getQuestionsByContentType(contentType) {
        const response = await fetch(`${API_BASE_URL}/questions/content-type/${contentType}`);
        return this.handleResponse(response);
    },

    async updateQuestion(id, data) {
        const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return this.handleResponse(response);
    },

    async deleteQuestion(id) {
        const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
            method: 'DELETE',
        });
        return this.handleResponse(response);
    },

    // Media
    async uploadMedia(file, questionId = null) {
        const formData = new FormData();
        formData.append('file', file);
        if (questionId) {
            formData.append('questionId', questionId);
        }

        const response = await fetch(`${API_BASE_URL}/media`, {
            method: 'POST',
            body: formData,
        });
        return this.handleResponse(response);
    },

    async getMedia(questionId = null) {
        const url = questionId 
            ? `${API_BASE_URL}/media?questionId=${questionId}`
            : `${API_BASE_URL}/media`;
        const response = await fetch(url);
        return this.handleResponse(response);
    },

    async getMediaById(id) {
        const response = await fetch(`${API_BASE_URL}/media/${id}`);
        return this.handleResponse(response);
    },

    async deleteMedia(id) {
        const response = await fetch(`${API_BASE_URL}/media/${id}`, {
            method: 'DELETE',
        });
        return this.handleResponse(response);
    },

    // Response handler
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    },
};
