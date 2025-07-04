class VirtualLawyer {
    constructor() {
        this.chatHistory = [];
        this.loadChatHistory();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchQuery');
        
        searchBtn.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        const actionCards = document.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                this.handleQuickAction(action);
            });
        });

        const sendChatBtn = document.getElementById('sendChatBtn');
        const chatInput = document.getElementById('chatInput');
        
        sendChatBtn.addEventListener('click', () => this.sendChatMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        const clearChatBtn = document.getElementById('clearChatBtn');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearChat());
        }

        const openChatBtn = document.getElementById('openChatBtn');
        const closeChatBtn = document.getElementById('closeChatBtn');
        const chatContainer = document.querySelector('.chat-section-container');

        if (openChatBtn && closeChatBtn && chatContainer) {
            openChatBtn.addEventListener('click', () => {
                chatContainer.classList.add('open');
            });

            closeChatBtn.addEventListener('click', () => {
                chatContainer.classList.remove('open');
            });
        }
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
        try {
            const response = await fetch('/proxy/kanoon/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    court: court || undefined,
                    year: year || undefined
                })
            });
            if (!response.ok) throw new Error('Backend request failed');
            const data = await response.json();
            return data.docs.map(doc => ({
                title: doc.title || 'Untitled Case',
                court: doc.docsource || 'N/A',
                year: doc.publishdate ? doc.publishdate.split('-')[0] : 'N/A',
                citation: doc.citation || 'N/A',
                snippet: doc.headline || 'No summary available',
                url: `https://indiankanoon.org/doc/${doc.tid}/`
            }));
        } catch (error) {
            console.error('Backend proxy error:', error);
            this.showNotification('Could not connect to the backend. Please make sure it is running.', 'error');
            return [];
        }
    }

    displaySearchResults(results) {
        const resultsContainer = document.getElementById('searchResults');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `<div class="no-results"><i class="fas fa-search"></i><h4>No results found</h4><p>Try adjusting your search terms or filters</p></div>`;
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
                    <button class="btn-secondary" onclick="window.open('${result.url || '#'}', '_blank')">
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
        resultsContainer.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i><h4>Search Error</h4><p>Unable to fetch results at the moment. Please try again later.</p></div>`;
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

    addToChat(caseTitle) {
        const message = `Can you tell me more about the case: ${caseTitle}?`;
        this.addChatMessage(message, 'user');
        
        this.getGeminiResponse(message).then(response => {
            this.addChatMessage(response, 'bot');
        }).catch(error => {
            console.error('Error getting Gemini response:', error);
            this.addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
        });
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();

        if (!message) return;

        this.addChatMessage(message, 'user');
        chatInput.value = '';

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

        messageDiv.innerHTML = `<div class="message-content"><p>${message}</p></div>`;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const chatEntry = { message, sender, timestamp: new Date() };
        this.chatHistory.push(chatEntry);
        this.saveChatHistory();
    }

    async getGeminiResponse(userMessage) {
        try {
            const response = await fetch('/proxy/gemini/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: { content: userMessage },
                    history: this.chatHistory.slice(-5)
                })
            });
            if (!response.ok) throw new Error('Gemini backend request failed');
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini backend proxy error:', error);
            this.showNotification('Could not connect to the backend. Please make sure it is running.', 'error');
            return 'An error occurred while trying to connect to the chatbot service.';
        }
    }

    saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
    }

    loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            this.chatHistory = JSON.parse(savedHistory);
            this.renderChatHistory();
        }
    }

    renderChatHistory() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        this.chatHistory.forEach(entry => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${entry.sender}-message`;
            messageDiv.innerHTML = `<div class="message-content"><p>${entry.message}</p></div>`;
            chatMessages.appendChild(messageDiv);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    clearChat() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        this.chatHistory = [];
        this.saveChatHistory();
        this.showNotification('Chat cleared successfully.', 'info');
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
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i><span>${message}</span>`;

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

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

let virtualLawyer;
document.addEventListener('DOMContentLoaded', () => {
    virtualLawyer = new VirtualLawyer();
});

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
