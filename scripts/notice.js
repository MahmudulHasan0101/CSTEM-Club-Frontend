class NoticeManager {
    constructor() {
        this.apiEndpoint = `${window.backendURL}/api/notices`; // Backend API endpoint
        this.noticesContainer = document.getElementById('noticesContent');
        this.init();
    }

    async init() {
        await this.loadNotices();
    }

    async loadNotices() {
        try {
            this.showLoading();
            console.log(this.apiEndpoint);
            const response = await fetch(this.apiEndpoint);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayNotices(data.notices || []);
            
        } catch (error) {
            console.error('Error loading notices:', error);
            this.showError(error.message);
        }
    }

    showLoading() {
        this.noticesContainer.innerHTML = `
            <div class="loading-card">
                <div class="loading-spinner"></div>
                <p style="margin-top: 20px; color: var(--text-secondary);">Loading notices...</p>
            </div>
        `;
    }

    showError(message) {
        this.noticesContainer.innerHTML = `
            <div class="error-message">
                <h3>⚠️ Error Loading Notices</h3>
                <p>Unable to load notices: ${message}</p>
                <button class="refresh-btn" onclick="noticeManager.loadNotices()">
                    🔄 Try Again
                </button>
            </div>
        `;
    }

    displayNotices(notices) {
        if (!notices || notices.length === 0) {
            this.showNoNotices();
            return;
        }

        // Sort notices by date (newest first)
        const sortedNotices = notices.sort((a, b) => new Date(b.date) - new Date(a.date));

        const noticesHTML = `
            <div class="notices-grid">
                ${sortedNotices.map(notice => this.createNoticeCard(notice)).join('')}
            </div>
        `;

        this.noticesContainer.innerHTML = noticesHTML;
        
        // Add entrance animation
        setTimeout(() => {
            document.querySelectorAll('.notice-card').forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 100);
    }

    createNoticeCard(notice) {
        const {
            id,
            title,
            content,
            date,
            type = 'notice',
            links = [],
            priority = 'normal'
        } = notice;

        const formattedDate = this.formatDate(date);
        const noticeTypeClass = this.getNoticeTypeClass(type);
        const linksHTML = this.createLinksHTML(links);

        return `
            <div class="notice-card" data-id="${id}" data-priority="${priority}">
                <div class="notice-header">
                    <h2 class="notice-title">${this.escapeHtml(title)}</h2>
                    <span class="notice-type ${noticeTypeClass}">${type}</span>
                </div>
                
                <div class="notice-date">${formattedDate}</div>
                
                <div class="notice-content">
                    ${this.formatContent(content)}
                </div>
                
                ${linksHTML}
            </div>
        `;
    }

    getNoticeTypeClass(type) {
        const typeMap = {
            'update': 'update',
            'maintenance': 'maintenance',
            'feature': 'feature',
            'announcement': 'announcement',
            'alert': 'maintenance',
            'info': 'update'
        };
        return typeMap[type.toLowerCase()] || '';
    }

    createLinksHTML(links) {
        if (!links || links.length === 0) return '';

        const linksHTML = links.map(link => {
            const { url, text, icon = '' } = link;
            return `
                <a href="${this.escapeHtml(url)}" 
                   class="notice-link" 
                   target="_blank" 
                   rel="noopener noreferrer">
                    ${icon ? icon + ' ' : ''}${this.escapeHtml(text)}
                </a>
            `;
        }).join('');

        return `<div class="notice-links">${linksHTML}</div>`;
    }

    formatContent(content) {
        // Convert line breaks to paragraphs and handle basic formatting
        return content
            .split('\n\n')
            .map(paragraph => `<p>${this.escapeHtml(paragraph.trim())}</p>`)
            .join('');
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return date.toLocaleDateString('en-US', options);
        } catch (error) {
            return dateString; // Fallback to original string if parsing fails
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNoNotices() {
        this.noticesContainer.innerHTML = `
            <div class="no-notices">
                <div class="no-notices-icon">📋</div>
                <h3>No Notices Available</h3>
                <p>There are currently no notices or updates to display.</p>
                <button class="refresh-btn" onclick="noticeManager.loadNotices()">
                    🔄 Refresh
                </button>
            </div>
        `;
    }

    // Method to manually refresh notices
    async refresh() {
        await this.loadNotices();
    }

    // Method to add real-time notice (for WebSocket integration)
    addNotice(notice) {
        // This could be used with WebSocket for real-time updates
        console.log('New notice received:', notice);
        this.loadNotices(); // Reload all notices for now
    }

    // Filter notices by type
    filterByType(type) {
        const cards = document.querySelectorAll('.notice-card');
        cards.forEach(card => {
            const cardType = card.querySelector('.notice-type').textContent.toLowerCase();
            if (type === 'all' || cardType === type.toLowerCase()) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Search notices
    searchNotices(query) {
        const cards = document.querySelectorAll('.notice-card');
        const searchQuery = query.toLowerCase();

        cards.forEach(card => {
            const title = card.querySelector('.notice-title').textContent.toLowerCase();
            const content = card.querySelector('.notice-content').textContent.toLowerCase();
            
            if (title.includes(searchQuery) || content.includes(searchQuery)) {
                card.style.display = 'block';
                // Highlight search terms (optional enhancement)
                this.highlightSearchTerm(card, query);
            } else {
                card.style.display = 'none';
            }
        });
    }

    highlightSearchTerm(card, query) {
        // Remove previous highlights
        card.querySelectorAll('.highlight').forEach(el => {
            el.outerHTML = el.innerHTML;
        });

        // Add new highlights (basic implementation)
        if (query.trim()) {
            const title = card.querySelector('.notice-title');
            const content = card.querySelector('.notice-content');
            
            [title, content].forEach(element => {
                if (element) {
                    element.innerHTML = element.innerHTML.replace(
                        new RegExp(`(${this.escapeRegExp(query)})`, 'gi'),
                        '<span class="highlight" style="background: rgba(102, 126, 234, 0.3); padding: 2px 4px; border-radius: 4px;">$1</span>'
                    );
                }
            });
        }
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Initialize the notice manager when DOM is loaded
let noticeManager;

document.addEventListener('DOMContentLoaded', () => {
    noticeManager = new NoticeManager();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NoticeManager;
}
