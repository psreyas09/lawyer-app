// Virtual Lawyer class to handle legal data search and AI responses
class VirtualLawyer {
    constructor() {
        this.apiBaseUrl = 'https://api.indiankanoon.org';
        this.geminiBaseUrl = 'https://api.gemini.com/v2.5/flash';
        // IMPORTANT: For demo purposes only. In production, API keys should be managed by a backend server.
        // Do not hardcode API keys in client-side code as it is insecure.
        this.kanoonApiKey = 'dcd2c2d79a409c534a73baa67cacf7a19088ce3b';
        this.geminiApiKey = 'your_gemini_api_key_here';
        this.chatHistory = [];
        this.loadChatHistory(); // Load chat history from local storage on initialization
        this.initializeEventListeners();
        this.showNotification('API keys are hardcoded for demo. In production, use a backend server for security.', 'warning');
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

        // Add a button or functionality to clear chat if needed
        const clearChatBtn = document.getElementById('clearChatBtn');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearChat());
        } else {
            // If no button exists, allow clearing via chat command
            chatInput.addEventListener('input', () => {
                const inputText = chatInput.value.toLowerCase().trim();
                if (inputText === 'clear chat' || inputText === 'clear history') {
                    this.clearChat();
                    chatInput.value = '';
                }
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
        // Due to CORS restrictions, direct API calls to Indian Kanoon from the browser are blocked.
        // In a production environment, a backend proxy server is required to make API requests.
        // For this demo, we will use mock data to simulate search results.
        this.showNotification('Direct API calls are blocked by CORS policy. Using mock data for demo. Set up a backend proxy for production use.', 'warning');
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockResults = this.generateMockResults(query, court, year);
                resolve(mockResults);
            }, 1500);
        });
    }
    
    generateMockResults(query, court, year) {
        const mockCases = [
            {
                title: "State of Maharashtra v. Rajesh Kumar",
                court: "Supreme Court of India",
                year: "2023",
                citation: "2023 SCC 145",
                snippet: "This case deals with the interpretation of Section 302 of the Indian Penal Code regarding murder charges. The court held that mere intention to cause bodily injury sufficient in the ordinary course of nature to cause death constitutes murder under Section 302.",
                url: "#",
                relevance: this.calculateRelevance(query, "criminal murder section 302 IPC")
            },
            {
                title: "Priya Sharma v. Union of India",
                court: "Delhi High Court",
                year: "2023",
                citation: "2023 DHC 892",
                snippet: "A landmark judgment on women's rights and workplace harassment. The court emphasized the importance of implementing proper grievance mechanisms in organizations as mandated by the Sexual Harassment of Women at Workplace Act, 2013.",
                url: "#",
                relevance: this.calculateRelevance(query, "women rights harassment workplace")
            },
            {
                title: "ABC Corporation v. XYZ Limited",
                court: "Bombay High Court",
                year: "2022",
                citation: "2022 BHC 567",
                snippet: "This commercial dispute case established important precedents regarding breach of contract and damages. The court ruled on the calculation of consequential damages in business transactions.",
                url: "#",
                relevance: this.calculateRelevance(query, "contract breach damages commercial")
            },
            {
                title: "Ram Singh v. State of Punjab",
                court: "Punjab and Haryana High Court",
                year: "2023",
                citation: "2023 PHC 234",
                snippet: "A criminal law case involving the interpretation of evidence under the Indian Evidence Act. The court discussed the admissibility of electronic evidence and digital forensics in criminal proceedings.",
                url: "#",
                relevance: this.calculateRelevance(query, "evidence electronic digital forensics")
            },
            {
                title: "Sunita Devi v. State of Bihar",
                court: "Patna High Court",
                year: "2023",
                citation: "2023 PatHC 156",
                snippet: "This case addressed domestic violence and protection of women under the Protection of Women from Domestic Violence Act, 2005. The court clarified the scope of 'domestic relationship' and remedies available.",
                url: "#",
                relevance: this.calculateRelevance(query, "domestic violence women protection")
            },
            {
                title: "Tech Solutions Pvt. Ltd. v. Commissioner of Income Tax",
                court: "Karnataka High Court",
                year: "2022",
                citation: "2022 KHC 789",
                snippet: "A taxation case dealing with software development expenses and their treatment under Income Tax Act. The court ruled on the deductibility of research and development expenses in the IT sector.",
                url: "#",
                relevance: this.calculateRelevance(query, "tax income software IT expenses")
            }
        ];

        // Filter results based on court and year if specified
        let filteredResults = mockCases;
        
        if (court) {
            filteredResults = filteredResults.filter(case_ => {
                const courtMap = {
                    'supreme': 'Supreme Court',
                    'high': 'High Court',
                    'district': 'District Court'
                };
                return case_.court.toLowerCase().includes(courtMap[court]?.toLowerCase() || court.toLowerCase());
            });
        }
        
        if (year) {
            filteredResults = filteredResults.filter(case_ => case_.year === year);
        }

        // Sort by relevance
        filteredResults.sort((a, b) => b.relevance - a.relevance);

        return filteredResults.slice(0, 5); // Return top 5 results
    }
    
    calculateRelevance(query, caseKeywords) {
        const queryWords = query.toLowerCase().split(' ');
        const keywords = caseKeywords.toLowerCase().split(' ');
        
        let matches = 0;
        queryWords.forEach(word => {
            if (keywords.some(keyword => keyword.includes(word) || word.includes(keyword))) {
                matches++;
            }
        });
        
        return matches / queryWords.length;
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
        const chatEntry = { message, sender, timestamp: new Date() };
        this.chatHistory.push(chatEntry);
        this.saveChatHistory(); // Save to local storage after each message
    }

    async getGeminiResponse(userMessage) {
        // Due to API access restrictions and for demo purposes, we will use mock responses.
        // In a production environment, a backend proxy server with proper API credentials is required.
        this.showNotification('Gemini API calls are not made in demo. Using mock responses. Set up a backend for production use.', 'warning');
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const response = this.generateAIResponse(userMessage);
                resolve(response);
            }, 1000);
        });
    }
    
    generateAIResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Check chat history for context
        let context = '';
        let topicContext = '';
        if (this.chatHistory.length > 1) {
            // Look at recent messages for context (last 5 messages to keep it manageable)
            const recentHistory = this.chatHistory.slice(-5, -1); // Exclude the current message
            
            // Check for specific legal topics in history to provide more relevant responses
            for (const msg of recentHistory) {
                const msgLower = msg.message.toLowerCase();
                if (msgLower.includes('theft') || msgLower.includes('stole') || msgLower.includes('stealing')) {
                    topicContext = 'theft';
                    context = this.getContextPrefix(topicContext);
                    break;
                } else if (msgLower.includes('assault') || msgLower.includes('hit') || msgLower.includes('attack')) {
                    topicContext = 'assault';
                    context = this.getContextPrefix(topicContext);
                    break;
                } else if (msgLower.includes('fraud') || msgLower.includes('cheat') || msgLower.includes('deceit')) {
                    topicContext = 'fraud';
                    context = this.getContextPrefix(topicContext);
                    break;
                } else if (msgLower.includes('drug') || msgLower.includes('narcotic') || msgLower.includes('possession')) {
                    topicContext = 'drugs';
                    context = this.getContextPrefix(topicContext);
                    break;
                } else if (msgLower.includes('murder') || msgLower.includes('section 302')) {
                    topicContext = 'murder';
                    context = this.getContextPrefix(topicContext);
                    break;
                } else if (msgLower.includes('bail') || msgLower.includes('anticipatory bail')) {
                    topicContext = 'bail';
                    context = this.getContextPrefix(topicContext);
                    break;
                } else if (msgLower.includes('contract') || msgLower.includes('breach')) {
                    topicContext = 'contract';
                    context = this.getContextPrefix(topicContext);
                    break;
                } else if (msgLower.includes('divorce') || msgLower.includes('marriage')) {
                    topicContext = 'divorce';
                    context = this.getContextPrefix(topicContext);
                    break;
                }
            }
            
            if (!context && recentHistory.some(msg => msg.sender === 'user')) {
                context = this.getContextPrefix('');
            }
        }
        
        // Legal concept explanations with context-aware responses
        if (lowerMessage.includes('section 302') || lowerMessage.includes('murder')) {
            if (topicContext && topicContext !== 'murder') {
                return context + "shifting to the topic of murder, Section 302 of the Indian Penal Code deals with punishment for murder. It states that whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine. How does this relate to the previous matter we were discussing?";
            }
            return context + "Section 302 of the Indian Penal Code deals with punishment for murder. It states that whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine. The key elements are: 1) Intention to cause death, or 2) Intention to cause bodily injury likely to cause death, or 3) Knowledge that the act is likely to cause death.";
        }
        
        if (lowerMessage.includes('article 21') || lowerMessage.includes('right to life')) {
            if (topicContext) {
                return context + "shifting to constitutional rights, Article 21 of the Indian Constitution guarantees the Right to Life and Personal Liberty. It states that 'No person shall be deprived of his life or personal liberty except according to procedure established by law.' This right might be relevant to your situation in terms of legal protections. Can you tell me more about how this connects to your case?";
            }
            return context + "Article 21 of the Indian Constitution guarantees the Right to Life and Personal Liberty. It states that 'No person shall be deprived of his life or personal liberty except according to procedure established by law.' This has been interpreted broadly to include right to livelihood, privacy, clean environment, and speedy trial.";
        }
        
        if (lowerMessage.includes('contract') || lowerMessage.includes('breach')) {
            if (topicContext && topicContext !== 'contract') {
                return context + "moving to contract law, under the Indian Contract Act, 1872, a breach of contract occurs when a party fails to perform any duty specified in the contract. Remedies include damages, specific performance, injunction, and quantum meruit. How does this relate to the legal issue you previously mentioned?";
            }
            return context + "Under the Indian Contract Act, 1872, a breach of contract occurs when a party fails to perform any duty specified in the contract. Remedies include: 1) Damages (compensatory, liquidated, penalty), 2) Specific performance, 3) Injunction, 4) Quantum meruit. The aggrieved party can claim compensation for losses directly arising from the breach.";
        }
        
        if (lowerMessage.includes('bail') || lowerMessage.includes('anticipatory bail')) {
            if (topicContext && topicContext !== 'bail') {
                return context + "regarding bail, it is the temporary release of an accused person awaiting trial. Under CrPC: Regular bail (Section 437/439) is granted after arrest, while anticipatory bail (Section 438) is granted before arrest. This could be relevant to the offense we were discussing. Can you provide more details about the situation?";
            }
            return context + "Bail is the temporary release of an accused person awaiting trial. Under CrPC: Regular bail (Section 437/439) is granted after arrest, while anticipatory bail (Section 438) is granted before arrest. Factors considered include: nature of offense, severity of punishment, character of accused, possibility of fleeing, and tampering with evidence.";
        }
        
        if (lowerMessage.includes('divorce') || lowerMessage.includes('marriage')) {
            if (topicContext && topicContext !== 'divorce') {
                return context + "shifting to family law, divorce in India is governed by personal laws. Under Hindu Marriage Act, grounds include cruelty, desertion, conversion, mental disorder, and more. How does this connect to the legal matter we were discussing?";
            }
            return context + "Divorce in India is governed by personal laws. Under Hindu Marriage Act, grounds include: cruelty, desertion, conversion, mental disorder, communicable disease, renunciation of world, and irretrievable breakdown (in some cases). Mutual consent divorce under Section 13B requires 6-month cooling period. Maintenance and child custody are separate considerations.";
        }
        
        // Responses for specific offenses with general legal guidance, enhanced with context
        if (lowerMessage.includes('theft') || lowerMessage.includes('stole') || lowerMessage.includes('stealing')) {
            if (topicContext && topicContext !== 'theft') {
                return context + "now discussing theft, it is defined under Section 378 of the Indian Penal Code as the dishonest intention to take movable property without consent. If involved in such an incident, consider consulting a lawyer, understanding penalties under Section 379, and preparing full disclosure for defense. How does this relate to the previous issue we discussed? Please note, this is general information, not legal advice.";
            }
            return context + "Theft is defined under Section 378 of the Indian Penal Code as the dishonest intention to take movable property out of the possession of any person without their consent. If you or someone you know is involved in such an incident, general steps could include: 1) Consulting a lawyer immediately for legal advice, 2) Understanding potential penalties under Section 379 (imprisonment up to 3 years, or fine, or both), 3) Preparing to provide full disclosure to your legal counsel for the best defense strategy. Please note, this is general information and not legal advice. For personalized assistance, contact a qualified lawyer.";
        }
        
        if (lowerMessage.includes('assault') || lowerMessage.includes('hit') || lowerMessage.includes('attack') || topicContext === 'assault') {
            if (topicContext && topicContext !== 'assault') {
                return context + "now addressing assault, it is covered under Section 351 of the Indian Penal Code, with penalties for causing hurt under Sections 323-338. General steps include seeking legal counsel and documenting evidence. How does this connect to the matter we were discussing? This is general guidance; consult a lawyer for specific advice.";
            }
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
                // Check if the last bot message already used a greeting or context prefix to avoid repetition
                let greetingContext = context;
                if (this.chatHistory.length > 0) {
                    const lastBotMessage = this.chatHistory.slice(-1)[0];
                    if (lastBotMessage.sender === 'bot' && (lastBotMessage.message.includes('Continuing our discussion on') || lastBotMessage.message.includes('Hello again'))) {
                        greetingContext = ''; // Omit the prefix to avoid repetition
                    }
                }
                return greetingContext + "Hello again! I'm here to continue assisting with your legal queries. What else would you like to know about this matter?";
            }
            if (lowerMessage.includes('forget') || lowerMessage.includes('forget it') || lowerMessage.includes('never mind') || lowerMessage.includes('nevermind') || lowerMessage.includes('drop it')) {
                return context + "I understand if you prefer not to continue this discussion. If you have any other legal matters or questions you'd like to explore, I'm here to assist. What else can I help you with?";
            }
            if (lowerMessage.includes('car') || lowerMessage.includes('vehicle') || lowerMessage.includes('accident')) {
                return context + "Assault involving a vehicle, such as hitting someone with a car, is a serious matter under Indian law. It may fall under Section 279 (rash driving) or Sections 323-338 (causing hurt) of the Indian Penal Code, depending on the circumstances and severity of injury. If you are involved in such a situation, consider these general steps: 1) Seek immediate legal counsel to understand your rights and obligations, 2) Be aware of potential penalties which can include fines and imprisonment, especially if negligence or intent is proven, 3) Document the incident thoroughly, including any evidence, witnesses, and whether medical aid was provided to the injured party, 4) Report the incident to the police as required by law to avoid further legal complications. This is general guidance; for specific legal advice tailored to your situation, consult with a qualified lawyer.";
            }
            if (lowerMessage.includes('escape') || lowerMessage.includes('run') || lowerMessage.includes('flee') || lowerMessage.includes('left') || lowerMessage.includes('way out') || lowerMessage.includes('easy way')) {
                return context + "Leaving the scene after an assault, especially involving a vehicle, can significantly aggravate the legal consequences under Indian law. This may be considered a hit-and-run under Section 304A (causing death by negligence) if injuries are severe or fatal, or it could lead to additional charges for failing to report an accident under the Motor Vehicles Act. There is no 'easy way out' as escaping can be viewed as evidence of guilt. General steps to consider: 1) Seek immediate legal counsel to understand the full extent of potential charges, 2) Be aware that penalties can include imprisonment and fines, 3) If possible, return to report the incident to the police to mitigate further legal issues. This is general guidance; for specific legal advice tailored to your situation, consult with a qualified lawyer.";
            }
            if (lowerMessage.includes('serious') || lowerMessage.includes('severity') || lowerMessage.includes('bad')) {
                return context + "The seriousness of an assault offense under Indian law depends on factors such as the extent of injury caused, intent, and circumstances. Under the Indian Penal Code, simple hurt (Section 323) can lead to imprisonment up to 1 year or fine, while grievous hurt (Section 325) can result in up to 7 years imprisonment and fine. If a vehicle was involved or if you left the scene, additional charges may apply. General steps: 1) Seek legal counsel to assess the specifics of your case, 2) Understand that courts consider aggravating factors like intent or negligence, 3) Document all details to prepare for legal proceedings. This is general guidance; for specific legal advice, consult with a qualified lawyer.";
            }
            if (lowerMessage.includes('bruise') || lowerMessage.includes('minor') || lowerMessage.includes('small injury') || lowerMessage.includes('not serious')) {
                return context + "Even minor injuries like a bruise resulting from an assault or vehicle incident can still have legal implications under Indian law. It may fall under Section 323 of the Indian Penal Code for causing simple hurt, which can lead to imprisonment up to 1 year or a fine. General steps to consider: 1) Seek legal counsel to understand the potential consequences, even for minor injuries, 2) Document the incident and any medical reports to clarify the extent of injury, 3) Consider reporting the incident to the police as it may still be required by law. This is general guidance; for specific legal advice tailored to your situation, consult with a qualified lawyer.";
            }
            if (lowerMessage.includes('compromise') || lowerMessage.includes('settle') || lowerMessage.includes('agreement') || lowerMessage.includes('ok to')) {
                return context + "Reaching a compromise or settlement after an assault or vehicle incident can be possible under Indian law, particularly for minor offenses under Section 320 of the Code of Criminal Procedure, which allows compounding of certain offenses with the consent of the victim. However, even if the other party agrees to compromise, there may still be legal obligations to report the incident, especially if a vehicle was involved. General steps to consider: 1) Seek legal counsel to ensure any agreement is legally valid and binding, 2) Be aware that serious offenses or cases involving public interest may not be compoundable, 3) Document any agreement in writing and consider involving authorities or a mediator to avoid future disputes. This is general guidance; for specific legal advice tailored to your situation, consult with a qualified lawyer.";
            }
            if (lowerMessage.includes('ok') || lowerMessage.includes('thanks') || lowerMessage.includes('thank you') || lowerMessage.includes('got it') || lowerMessage.includes('understood')) {
                return context + "I'm glad I could provide some guidance. If you have any further questions or need additional details about this matter, feel free to ask. Remember, for specific legal advice tailored to your situation, consulting with a qualified lawyer is recommended.";
            }
            if (lowerMessage.includes('how are you') || lowerMessage.includes('how r u') || lowerMessage.includes('how you doing') || lowerMessage.includes('hows it going')) {
                // Check if the last bot message already used a context prefix to avoid repetition
                let casualContext = context;
                if (this.chatHistory.length > 0) {
                    const lastBotMessage = this.chatHistory.slice(-1)[0];
                    if (lastBotMessage.sender === 'bot' && lastBotMessage.message.includes('Continuing our discussion on')) {
                        casualContext = ''; // Omit the prefix to avoid repetition
                    }
                }
                return casualContext + "I'm doing well, thank you for asking! I'm here to assist with any legal queries you might have. What else would you like to know about this matter?";
            }
            return context + "Assault is covered under Section 351 of the Indian Penal Code, and causing hurt under Sections 323-338 depending on the severity. If you are involved in such a situation, consider these general steps: 1) Seek immediate legal counsel to understand your rights and obligations, 2) Be aware of potential penalties which can range from fines to imprisonment based on injury caused, 3) Document any evidence or witnesses that might support your case. This is general guidance; for specific legal advice, consult with a qualified lawyer.";
        }
        
        if (lowerMessage.includes('fraud') || lowerMessage.includes('cheat') || lowerMessage.includes('deceit')) {
            if (topicContext && topicContext !== 'fraud') {
                return context + "turning to fraud, it is an offense under Section 420 of the Indian Penal Code, involving dishonest inducement. General guidance includes contacting a lawyer and gathering evidence. How does this relate to the previous legal issue? This is general information; consult a lawyer for tailored advice.";
            }
            return context + "Fraud and cheating are offenses under Section 420 of the Indian Penal Code, involving dishonest inducement to deliver property or valuable security. If you are dealing with such a matter, general guidance includes: 1) Contacting a lawyer to discuss the specifics of your case, 2) Understanding potential penalties which may include imprisonment up to 7 years and fine, 3) Gathering any documentation or evidence of the transaction or deceit. This information is general; for tailored legal advice, consult a qualified lawyer.";
        }
        
        if (lowerMessage.includes('drug') || lowerMessage.includes('narcotic') || lowerMessage.includes('possession')) {
            if (topicContext && topicContext !== 'drugs') {
                return context + "now discussing drug-related offenses, they are governed by the Narcotic Drugs and Psychotropic Substances Act, 1985, with severe penalties. Consider seeking legal representation immediately. How does this connect to the matter we were discussing? This is general information; consult a lawyer for specific advice.";
            }
            return context + "Drug-related offenses are governed by the Narcotic Drugs and Psychotropic Substances Act, 1985. Possession, sale, or consumption of prohibited substances can lead to severe penalties. If involved in such a situation, consider: 1) Seeking legal representation immediately to navigate the complex laws, 2) Understanding that penalties vary based on the quantity and type of substance (small quantity vs commercial quantity), 3) Being aware of potential imprisonment and fines. This is general information; for specific advice, consult a qualified lawyer.";
        }
        
        // General responses based on keywords with context awareness
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            if (topicContext) {
                // Check if the last bot message already used a context prefix to avoid repetition
                let greetingContext = context;
                if (this.chatHistory.length > 0) {
                    const lastBotMessage = this.chatHistory.slice(-1)[0];
                    if (lastBotMessage.sender === 'bot' && lastBotMessage.message.includes('Continuing our discussion on')) {
                        greetingContext = ''; // Omit the prefix to avoid repetition
                    }
                }
                return greetingContext + "Hello again! I'm here to continue assisting with your legal queries. What else would you like to know about this matter?";
            }
            return context + "Hello! I'm your virtual legal assistant. I can help you understand Indian laws, search for legal cases, explain legal concepts, and provide guidance on legal procedures. What legal matter would you like to discuss today?";
        }
        
        if (lowerMessage.includes('forget') || lowerMessage.includes('forget it') || lowerMessage.includes('never mind') || lowerMessage.includes('nevermind') || lowerMessage.includes('drop it')) {
            if (topicContext) {
                return context + "I understand if you prefer not to continue this discussion. If you have any other legal matters or questions you'd like to explore, I'm here to assist. What else can I help you with?";
            }
            return context + "No problem, if you'd like to discuss a different legal matter or have any other questions, I'm here to help. What can I assist you with?";
        }
        
        if (lowerMessage.includes('criminal')) {
            if (topicContext) {
                return context + "Regarding criminal law, it is governed by the Indian Penal Code (IPC), 1860, and other statutes. How does this relate to the specific issue we've been discussing? I can explain specific sections or procedures if needed.";
            }
            return context + "Criminal law in India is primarily governed by the Indian Penal Code (IPC), 1860, Code of Criminal Procedure (CrPC), 1973, and Indian Evidence Act, 1872. I can help explain specific sections, procedures, or recent judgments. What specific criminal law topic interests you?";
        }
        
        if (lowerMessage.includes('civil')) {
            if (topicContext) {
                return context + "Civil law covers disputes between individuals or entities. Key acts include Contract Act 1872 and others. How does this connect to the legal matter we were discussing? What specific civil law issue can I help with?";
            }
            return context + "Civil law covers disputes between individuals/entities. Key acts include Contract Act 1872, Transfer of Property Act 1882, Civil Procedure Code 1908. Areas include contracts, property, torts, family matters. What specific civil law issue can I help with?";
        }
        
        if (lowerMessage.includes('constitutional')) {
            if (topicContext) {
                return context + "The Indian Constitution is the supreme law with key features like fundamental rights. How does this relate to the issue we've been discussing? Which constitutional provision would you like to understand?";
            }
            return context + "The Indian Constitution is the supreme law. It has 395 articles in 22 parts and 12 schedules. Key features include fundamental rights (Articles 12-35), directive principles (36-51), and fundamental duties (51A). Which constitutional provision would you like to understand?";
        }
        
        if (lowerMessage.includes('property') || lowerMessage.includes('real estate')) {
            if (topicContext) {
                return context + "Property law in India is governed by the Transfer of Property Act, 1882. How does this connect to the matter we were discussing? What property law issue can I assist with?";
            }
            return context + "Property law in India is governed by the Transfer of Property Act, 1882, and Registration Act, 1908. Key concepts include sale, mortgage, lease, gift, and easements. Property registration is mandatory for transactions above ₹100. What property law matter can I assist with?";
        }
        
        if (lowerMessage.includes('company') || lowerMessage.includes('corporate')) {
            if (topicContext) {
                return context + "Corporate law is governed by the Companies Act, 2013. How does this relate to the legal issue we've been discussing? What corporate law aspect interests you?";
            }
            return context + "Corporate law is governed by the Companies Act, 2013. It covers incorporation, management, compliance, mergers, and winding up. Key bodies include MCA, NCLT, and NCLAT. Recent amendments focus on ease of doing business. What corporate law aspect interests you?";
        }
        
        // Default responses
        const defaultResponses = [
            context + "That's an interesting legal question. Could you provide more specific details so I can give you more targeted information? For example, which area of law does this relate to?",
            context + "I'd be happy to help with that legal matter. To provide the most accurate information, could you specify whether this relates to criminal law, civil law, constitutional law, or another area?",
            context + "Legal matters can be complex and fact-specific. While I can provide general information about Indian laws and procedures, I recommend consulting with a qualified lawyer for specific legal advice. How can I help explain the general legal principles?",
            context + "I can help research relevant case law and explain legal concepts. Would you like me to search for cases related to your query or explain specific legal provisions?"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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

    // Methods to handle chat history caching in a JSON file (simulated)
    saveChatHistory() {
        try {
            // In a real environment, this would write to a JSON file on the server
            // For demo purposes, we'll still use localStorage to simulate file storage
            localStorage.setItem('chatHistory.json', JSON.stringify(this.chatHistory));
            // Note: Direct file operations are not possible in a browser, even when hosted. A backend server is required.
            this.showNotification('Chat history saved to simulated JSON file. Direct file storage requires a backend server, even when hosted.', 'info');
        } catch (error) {
            console.error('Error saving chat history to simulated JSON file:', error);
            this.showNotification('Error saving chat history.', 'error');
        }
    }

    loadChatHistory() {
        try {
            // In a real environment, this would read from a JSON file on the server
            // For demo purposes, we'll retrieve from localStorage to simulate file reading
            const savedHistory = localStorage.getItem('chatHistory.json');
            if (savedHistory) {
                this.chatHistory = JSON.parse(savedHistory);
                this.renderChatHistory();
            }
            // Note: Direct file operations are not possible in a browser, even when hosted. A backend server is required.
            this.showNotification('Chat history loaded from simulated JSON file. Direct file storage requires a backend server, even when hosted.', 'info');
        } catch (error) {
            console.error('Error loading chat history from simulated JSON file:', error);
            this.chatHistory = [];
            this.showNotification('Error loading chat history.', 'error');
        }
    }

    renderChatHistory() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = ''; // Clear current display
        this.chatHistory.forEach(entry => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${entry.sender}-message`;
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${entry.message}</p>
                </div>
            `;
            chatMessages.appendChild(messageDiv);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    clearChat() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = ''; // Clear the visible chat
        this.chatHistory = []; // Clear the in-memory history
        this.saveChatHistory(); // Update local storage to clear saved history
        this.showNotification('Chat cleared successfully.', 'info');
    }

    getContextPrefix(topicContext) {
        // Check if the last bot message already used a context prefix to avoid repetition
        if (this.chatHistory.length > 0) {
            const lastBotMessage = this.chatHistory.slice(-1)[0];
            if (lastBotMessage.sender === 'bot' && lastBotMessage.message.includes('Continuing our discussion on')) {
                return ''; // Omit the prefix to avoid repetition
            }
        }
        // Return appropriate prefix based on topic
        switch (topicContext) {
            case 'theft':
                return "Continuing our discussion on theft, ";
            case 'assault':
                return "Continuing our discussion on assault, ";
            case 'fraud':
                return "Continuing our discussion on fraud, ";
            case 'drugs':
                return "Continuing our discussion on drug-related issues, ";
            case 'murder':
                return "Continuing our discussion on murder, ";
            case 'bail':
                return "Continuing our discussion on bail, ";
            case 'contract':
                return "Continuing our discussion on contracts, ";
            case 'divorce':
                return "Continuing our discussion on divorce, ";
            default:
                return "I see we've been discussing a legal matter. ";
        }
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
