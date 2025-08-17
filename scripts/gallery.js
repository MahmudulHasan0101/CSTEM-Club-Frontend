		let currentFilter = 'all';
        let galleryItems = [];

        // Load gallery on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadGallery();
            setupEventListeners();
        });

        function setupEventListeners() {
            // Filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentFilter = this.dataset.filter;
                    filterGallery();
                });
            });

            // Lightbox close on background click
            document.getElementById('lightbox').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeLightbox();
                }
            });

            // Keyboard navigation
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && document.getElementById('lightbox').classList.contains('active')) {
                    closeLightbox();
                }
            });
        }

        async function loadGallery() {
            const gridContainer = document.getElementById('galleryGrid');
            const errorMessage = document.getElementById('errorMessage');
            
            // Show loading skeletons
            showLoadingSkeletons();
            errorMessage.style.display = 'none';

            try {
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const response = await fetch('/api/gallery');
                const data = await response.json();
                
                if (!data || data.length === 0) {
                    throw new Error('No images found');
                }

                galleryItems = data;
                renderGallery(data);
                
            } catch (error) {
                console.error('Error loading gallery:', error);
                gridContainer.innerHTML = '';
                errorMessage.style.display = 'block';
            }
        }

        function showLoadingSkeletons() {
            const gridContainer = document.getElementById('galleryGrid');
            const skeletonHtml = Array(8).fill(0).map(() => 
                '<div class="gallery-skeleton"></div>'
            ).join('');
            gridContainer.innerHTML = skeletonHtml;
        }

        function renderGallery(items) {
            const gridContainer = document.getElementById('galleryGrid');
            
            const galleryHtml = items.map((item, index) => `
                <div class="gallery-item" data-category="${item.category}" style="animation-delay: ${index * 0.1}s" onclick="openLightbox('${item.src}', '${item.title}')">
                    <img src="${item.src}" alt="${item.title}" loading="lazy">
                    <div class="category-tag">${item.category}</div>
                    <div class="gallery-item-info">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                </div>
            `).join('');
            
            gridContainer.innerHTML = galleryHtml;
        }


        function openLightbox(src, title) {
            const lightbox = document.getElementById('lightbox');
            const lightboxImage = document.getElementById('lightboxImage');
            
            lightboxImage.src = src;
            lightboxImage.alt = title;
            lightbox.classList.add('active');
            
            // Prevent body scrolling
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            const lightbox = document.getElementById('lightbox');
            lightbox.classList.remove('active');
            
            // Restore body scrolling
            document.body.style.overflow = 'auto';
        }