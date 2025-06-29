// Virtual Lawyer class to handle legal data search and AI responses
class VirtualLawyer {
    constructor() {
        this.apiBaseUrl = 'https://api.indiankanoon.org';
        this.geminiBaseUrl = 'https://api.gemini.com/v2.5/flash';
        this.kanoonApiKey = '';
        this.geminiApiKey = '';
        this.chatHistory = [];
        this.loadEnvVariables();
        this.initializeEventListeners();
    }

    // Load environment variables from .env file
    async loadEnvVariables() {
        try {
            // In a real environment, this would be handled by a backend server
            // For this example, we'll use fetch to simulate reading from .env
            // Note: Fetching .env directly is not secure for production
            const response = await fetch('/.env');
            const envText = await response.text();
            const envLines = envText.split('\n');
            envLines.forEach(line => {
                if (line.startsWith('KANOON_API_KEY=')) {
                    this.kanoonApiKey = line.split('=')[1].trim();
                } else if (line.startsWith('GEMINI_API_KEY=')) {
                    this.geminiApiKey = line.split('=')[1].trim();
                }
            });
            if (!this.kanoonApiKey || !this.geminiApiKey) {
                this.showNotification('API keys are not set. Please update the .env file.', 'error');
            }
        } catch (error) {
            console.error('Error loading environment variables:', error);
            this.showNotification('Failed to load API keys. Check console for details.', 'error');
        }
    }

    initializeEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchQuery');
        
        searchBtn.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Quick action cards
        const actionCards = document.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Chat functionality
        const sendChatBtn = document.getElementById('sendChatBtn');
        const chatInput = document.getElementById('chatInput');
        
        sendChatBtn.addEventListener('click', () => this.sendChatMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }

    async performSearch() {
        const query = document.getElementById('searchQuery').value.trim();
        const courtFilter = document.getElementById('courtFilter').value;
        const yearFilter = document.getElementById('yearFilter').value;

        if (!query) {
            this.showNotification('Please enter a search query', 'warning');
            return;
        }

        this.showLoading(true);
        this.showResultsSection(true);

        try {
            const results = await this.searchLegalCases(query, courtFilter, yearFilter);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            this.displaySearchError();
        } finally {
            this.showLoading(false);
        }
    }

    async searchLegalCases(query, court, year) {
        if (!this.kanoonApiKey) {
            throw new Error('Kanoon API key is not set');
        }

        const url = `${this.apiBaseUrl}/search/?formInput=${encodeURIComponent(query)}`;
        const headers = {
            'Authorization': `Token ${this.kanoonApiKey}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const data = await response.json();
            let filteredResults = data.results || [];

            if (court) {
                filteredResults = filteredResults.filter(case_ => {
                    const courtMap = {
                        'supreme': 'Supreme Court',
                        'high': 'High Court',
                        'district': 'District Court'
                    };
                    return case_.court?.toLowerCase().includes(courtMap[court]?.toLowerCase() || court.toLowerCase());
                });
            }

            if (year) {
                filteredResults = filteredResults.filter(case_ => case_.year === year);
            }

            return filteredResults.slice(0, 5); // Return top 5 results
        } catch (error) {
            console.error('Error fetching data from Kanoon API:', error);
            throw error;
        }
    }

    displaySearchResults(results) {
        const resultsContainer = document.getElementById('searchResults');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h4>No results found</h4>
                    <p>Try adjusting your search terms or filters</p>
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(result => `
            <div class="result-item">
                <div class="result-title">${result.title}</div>
                <div class="result-meta">
                    <span><i class="fas fa-gavel"></i> ${result.court || 'N/A'}</span>
                    <span><i class="fas fa-calendar"></i> ${result.year || 'N/A'}</span>
                    <span><i class="fas fa-bookmark"></i> ${result.citation || 'N/A'}</span>
                </div>
                <div class="result-snippet">${result.snippet || 'No summary available'}</div>
                <div class="result-actions">
                    <button class="btn-secondary" onclick="virtualLawyer.viewFullCase('${result.citation || 'N/A'}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn-secondary" onclick="virtualLawyer.addToChat('${result.title.replace(/'/g, "\\'")}')">
                        <i class="fas fa-comment"></i> Discuss in Chat
                    </button>
                </div>
            </div>
        `).join('');

        resultsContainer.innerHTML = resultsHTML;
    }

    displaySearchError() {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Search Error</h4>
                <p>Unable to fetch results at the moment. Please try again later.</p>
                <p><small>Note: Ensure your API keys are correctly set in the .env file.</small></p>
            </div>
        `;
    }

    handleQuickAction(action) {
        const queries = {
            criminal: 'criminal law cases India IPC murder theft',
            civil: 'civil litigation contract property disputes',
            constitutional: 'constitutional law fundamental rights Article',
            corporate: 'corporate law company disputes contract breach'
        };

        document.getElementById('searchQuery').value = queries[action] || '';
        this.performSearch();
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();

        if (!message) return;

        this.addChatMessage(message, 'user');
        chatInput.value = '';

        // Get AI response from Gemini
        this.getGeminiResponse(message).then(response => {
            this.addChatMessage(response, 'bot');
        }).catch(error => {
            console.error('Error getting Gemini response:', error);
            this.addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
        });
    }

    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Store in chat history
        this.chatHistory.push({ message, sender, timestamp: new Date() });
    }

    async getGeminiResponse(userMessage) {
        if (!this.geminiApiKey) {
            throw new Error('Gemini API key is not set');
        }

        const url = `${this.geminiBaseUrl}/generate`;
        const headers = {
            'Authorization': `Bearer ${this.geminiApiKey}`,
            'Content-Type': 'application/json'
        };
        const body = JSON.stringify({
            prompt: `You are a legal assistant. Respond to the following query with accurate legal information under Indian law: ${userMessage}`,
            max_tokens: 500
        });

        try {
            const response = await fetch(url, { method: 'POST', headers, body });
            if (!response.ok) {
                throw new Error(`Gemini API request failed with status ${response.status}`);
            }
            const data = await response.json();
            return data.generated_text || 'I am unable to provide a response at this time. Please try again.';
        } catch (error) {
            console.error('Error fetching Gemini response:', error);
            throw error;
        }
    }

    viewFullCase(citation) {
        // Create a modal to show case details
        const modal = document.createElement('div');
        modal.className = 'case-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Case Details: ${citation}</h3>
                    <button class="close-modal" onclick="this.closest('.case-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p><strong>Note:</strong> Full case details would be fetched using the Kanoon API in a production environment.</p>
                    <p>The case ${citation} would typically include:</p>
                    <ul>
                        <li>Complete judgment text</li>
                        <li>Case facts and procedural history</li>
                        <li>Legal issues and arguments</li>
                        <li>Court's analysis and reasoning</li>
                        <li>Final judgment and orders</li>
                        <li>Citations and references</li>
                    </ul>
                    <p>Ensure your API key is set correctly to access full documents.</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add modal styles
        if (!document.querySelector('.modal-styles')) {
            const style = document.createElement('style');
            style.className = 'modal-styles';
            style.textContent = `
                .case-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    border-radius: 15px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-body {
                    padding: 20px;
                }
                .close-modal {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                }
                .close-modal:hover {
                    color: #333;
                }
            `;
            document.head.appendChild(style);
        }
    }

    showLoading(show) {
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = show ? 'block' : 'none';
    }

    showResultsSection(show) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = show ? 'block' : 'none';
    }

    showNotification(message, type = 'info') {
        // Create a simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add notification styles if not already present
        if (!document.querySelector('.notification-styles')) {
            const style = document.createElement('style');
            style.className = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                }
                .notification-info { border-left: 4px solid #3498db; }
                .notification-warning { border-left: 4px solid #f39c12; }
                .notification-error { border-left: 4px solid #e74c3c; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the Virtual Lawyer when the page loads
let virtualLawyer;
document.addEventListener('DOMContentLoaded', () => {
    virtualLawyer = new VirtualLawyer();
});

// Add additional CSS for result actions
document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.result-actions-styles')) {
        const style = document.createElement('style');
        style.className = 'result-actions-styles';
        style.textContent = `
            .result-actions {
                margin-top: 15px;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            .btn-secondary {
                padding: 8px 15px;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                color: #495057;
                text-decoration: none;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .btn-secondary:hover {
                background: #e9ecef;
                border-color: #adb5bd;
                transform: translateY(-1px);
            }
            .no-results, .error-message {
                text-align: center;
                padding: 40px;
                color: #666;
            }
            .no-results i, .error-message i {
                font-size: 3rem;
                margin-bottom: 15px;
                color: #ccc;
            }
            .error-message i {
                color: #e74c3c;
            }
        `;
        document.head.appendChild(style);
    }
});
