
		function createParticles() {
            const particleCount = 50;
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
                document.body.appendChild(particle);
            }
        }

        // Mobile menu functions
        function toggleMobileMenu() {
            const hamburgerBtn = document.querySelector('.hamburger-btn');
            const mobileMenu = document.querySelector('.mobile-menu');
            const overlay = document.querySelector('.mobile-menu-overlay');

            hamburgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        function closeMobileMenu() {
            const hamburgerBtn = document.querySelector('.hamburger-btn');
            const mobileMenu = document.querySelector('.mobile-menu');
            const overlay = document.querySelector('.mobile-menu-overlay');

            hamburgerBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
        }

        // Section toggle function
        function toggleSection(sectionCard) {
            sectionCard.classList.toggle('active');
        }

        // Initialize particles on page load
        window.addEventListener('load', () => {
            createParticles();
        });

        // Close mobile menu when clicking on nav items
        document.querySelectorAll('.mobile-menu-item a').forEach(item => {
            item.addEventListener('click', closeMobileMenu);
        });