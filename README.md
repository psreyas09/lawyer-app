# Virtual Lawyer - Indian Legal Assistant

A web-based virtual lawyer application that provides legal assistance using Indian law and case database. This application simulates the functionality of searching legal cases, understanding legal concepts, and providing legal guidance through an interactive chat interface.

## Features

### 🔍 Legal Case Search
- Search through Indian legal cases and judgments
- Filter by court type (Supreme Court, High Court, District Court)
- Filter by year
- Relevance-based search results
- Quick action buttons for different law categories

### 💬 Interactive Legal Chat
- AI-powered legal assistant
- Explains legal concepts and procedures
- Provides guidance on Indian laws
- Contextual responses based on legal queries

### 📚 Legal Categories
- **Criminal Law**: IPC, CrPC, Evidence Act
- **Civil Law**: Contract Act, Property Law, Torts
- **Constitutional Law**: Fundamental Rights, Constitutional Provisions
- **Corporate Law**: Companies Act, Business Law

### 🎨 Modern UI/UX
- Responsive design for all devices
- Clean and professional interface
- Smooth animations and transitions
- Accessible design principles

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with Flexbox/Grid
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start using the virtual lawyer assistant

### File Structure
```
virtual-lawyer/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # Project documentation
```

## Usage

### Searching Legal Cases
1. Enter your legal query in the search box
2. Optionally select court type and year filters
3. Click "Search" to find relevant cases
4. View case details and discuss in chat

### Using Quick Actions
- Click on any category card (Criminal, Civil, Constitutional, Corporate)
- This will automatically search for cases in that category

### Chat Assistant
1. Type your legal question in the chat input
2. Press Enter or click the send button
3. Get instant responses about legal concepts
4. Ask follow-up questions for clarification

## Legal Concepts Covered

### Criminal Law
- Indian Penal Code (IPC) sections
- Criminal Procedure Code (CrPC)
- Bail and anticipatory bail
- Evidence and procedure

### Civil Law
- Contract law and breach remedies
- Property law and transfers
- Civil procedure and litigation
- Tort law principles

### Constitutional Law
- Fundamental Rights (Articles 12-35)
- Directive Principles of State Policy
- Constitutional amendments and interpretation

### Corporate Law
- Companies Act 2013
- Corporate governance
- Mergers and acquisitions
- Compliance requirements

## API Integration Note

This is currently a demo version that uses simulated data. The Indian Kanoon API requires:
- Authentication credentials
- Proper API key registration
- Backend proxy to handle CORS restrictions
- Compliance with their terms of service

For production use:
1. Register at [Indian Kanoon API](https://api.indiankanoon.org)
2. Obtain API credentials
3. Set up a backend server to proxy API requests
4. Replace mock data with actual API calls

## Sample Legal Queries

Try these example searches:
- "Section 302 IPC murder cases"
- "Article 21 right to life"
- "Contract breach damages"
- "Domestic violence protection"
- "Bail anticipatory bail"
- "Property transfer registration"

## Chat Examples

Ask the legal assistant:
- "What is Section 302 of IPC?"
- "Explain Article 21 of Constitution"
- "How to file for divorce in India?"
- "What are the grounds for bail?"
- "Explain contract law basics"

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Design

The application is fully responsive and works on:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## Legal Disclaimer

⚠️ **Important Legal Notice**

This application is for educational and informational purposes only. It does not constitute legal advice and should not be relied upon as a substitute for consultation with a qualified attorney. 

- Always consult with a licensed lawyer for specific legal matters
- Laws and regulations may change over time
- Case law interpretations may vary
- This tool provides general information only

## Future Enhancements

### Planned Features
- Real Indian Kanoon API integration
- Advanced search filters
- Case law citations and references
- Legal document templates
- Multi-language support (Hindi, regional languages)
- Voice search and response
- Legal news and updates
- Bookmark and save functionality

### Technical Improvements
- Progressive Web App (PWA) support
- Offline functionality
- Enhanced AI responses
- Better search algorithms
- Performance optimizations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Development Setup

For developers who want to enhance this project:

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd virtual-lawyer

# Open in your preferred editor
code .

# For local development, use a simple HTTP server
python -m http.server 8000
# or
npx serve .
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Indian Kanoon for providing legal database access
- Font Awesome for icons
- Google Fonts for typography
- The legal community for inspiration and guidance

## Support

For support, questions, or suggestions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Version History

- **v1.0.0** - Initial release with basic functionality
- **v1.1.0** - Enhanced chat responses and UI improvements
- **v1.2.0** - Added search filters and case details modal

---

**Made with ❤️ for the Indian legal community**
