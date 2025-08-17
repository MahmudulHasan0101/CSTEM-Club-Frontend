		window.backendURL = "";

		// promise that resolves when backendURL is loaded (or rejects on error)
		window.backendReady = (async () => {
		  try {
			const resp = await fetch('/assets/backendurl.txt', { cache: 'no-store' });
			if (!resp.ok) throw new Error(`Failed to fetch backend URL: ${resp.status}`);
			const raw = (await resp.text()).trim();

			if (!raw || raw.toLowerCase() === 'null') {
			  throw new Error('backendurl.txt is empty or contains "null"');
			}

			// normalize: remove trailing slashes
			window.backendURL = raw.replace(/\/+$/, '');
			// optional: dispatch an event for non-awaiting code
			window.dispatchEvent(new Event('backend-url-ready'));
			return window.backendURL;
		  } catch (err) {
			console.error('Error reading backend URL:', err);
			// fallback if you want a default instead of rejecting:
			// window.backendURL = 'http://localhost:5005';
			// return window.backendURL;
			throw err; // keep rejecting so callers can handle it
		  }
		})();
		
		window.backendURL.replace("/null", "");
		
		
		document.addEventListener("DOMContentLoaded", function () {
			startLoading();
			
			fetch(`${window.backendURL}/api/isloggedin`)
				.then(res => res.json())
				.then(data => {
					const userItem = document.querySelectorAll(".user-item");
					const guestItem = document.querySelectorAll(".guest-item");

					if (data.loggedIn) {
						guestItem.forEach(el => el.style.display = "none");
						userItem.forEach(el => el.style.display = "block");
					} else {
						guestItem.forEach(el => el.style.display = "block");
						userItem.forEach(el => el.style.display = "none");
					}
				});
		});

        // Create floating particles
        function createParticles() {
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + 'vw';
                particle.style.top = Math.random() * 100 + 'vh';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
                document.body.appendChild(particle);
            }
        }

        // Initialize
        window.addEventListener('load', () => {
            createParticles();
			setTimeout(endLoading, 800);
        });

        // Smooth scrolling for mobile
        document.addEventListener('touchstart', function() {}, {passive: true});
		
		
		const navToggle = document.querySelector('.nav-toggle');
		const navMenu = document.querySelector('.nav-menu');

		try {
			navToggle.addEventListener('click', () => {
				navMenu.classList.toggle('show');
			});
		}
		 catch (error) {
			console.error("An error occurred:", error.message);
		}


        function toggleMobileMenu() {
            const hamburgerBtn = document.querySelector('.hamburger-btn');
            const mobileMenu = document.querySelector('.mobile-menu');
            const overlay = document.querySelector('.mobile-menu-overlay');
            
            hamburgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        }

        function closeMobileMenu() {
            const hamburgerBtn = document.querySelector('.hamburger-btn');
            const mobileMenu = document.querySelector('.mobile-menu');
            const overlay = document.querySelector('.mobile-menu-overlay');
            
            hamburgerBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            
            // Restore body scroll
            document.body.style.overflow = '';
        }

        // Handle active menu item
        document.querySelectorAll('.mobile-menu-item a').forEach(link => {
            link.addEventListener('click', function() {
                document.querySelectorAll('.mobile-menu-item').forEach(item => {
                    item.classList.remove('active');
                });
                this.parentElement.classList.add('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            const mobileNav = document.querySelector('.mobile-nav');
            const mobileMenu = document.querySelector('.mobile-menu');
            
            if (!mobileNav.contains(e.target) && !mobileMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
		
		
		
	  let overlayElement = null;

	  function startLoading() {
		if (overlayElement) return; 

		// Blur background
		document.body.classList.add("loading-active");

		// Create overlay
		overlayElement = document.createElement("div");
		overlayElement.className = "loading-overlay";

		// Create spinner
		const spinner = document.createElement("div");
		spinner.className = "loading-spinner";
		overlayElement.appendChild(spinner);

		// Append overlay to body
		document.body.appendChild(overlayElement);
	  }

	  function endLoading() {
		if (!overlayElement) return;

		// Smooth fade-out
		overlayElement.style.animation = "fadeOut 0.3s ease forwards";
		document.body.classList.remove("loading-active");

		// Remove after animation
		setTimeout(() => {
		  if (overlayElement && overlayElement.parentNode) {
			overlayElement.parentNode.removeChild(overlayElement);
		  }
		  overlayElement = null;
		}, 300);
	  }