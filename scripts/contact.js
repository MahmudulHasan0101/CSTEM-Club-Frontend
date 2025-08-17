
		function toggleFAQ(question) {
            const faqItem = question.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const toggle = question.querySelector('.faq-toggle');
            
            const isOpen = faqItem.classList.contains('active');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item.active').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = '0';
                    item.querySelector('.faq-toggle').textContent = '+';
                }
            });
            
            if (isOpen) {
                faqItem.classList.remove('active');
                answer.style.maxHeight = '0';
                toggle.textContent = '+';
            } else {
                faqItem.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                toggle.textContent = '−';
            }
        }

        // Create floating particles
        function createParticles() {
            const particlesContainer = document.querySelector('.particles-container');
            
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        // Initialize particles on load
        document.addEventListener('DOMContentLoaded', createParticles);

        // Add scroll effect to platform links
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, observerOptions);

        document.addEventListener('DOMContentLoaded', () => {
            const platformLinks = document.querySelectorAll('.platform-link');
            platformLinks.forEach(link => observer.observe(link));
        });