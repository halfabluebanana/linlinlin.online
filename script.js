// MINIMAL FUNCTIONALITY

document.addEventListener('DOMContentLoaded', function() {
    console.log('linlinlin.online loaded');
    
    // Add info-page class to body if on info page
    if (window.location.pathname.includes('info') || window.location.pathname.endsWith('/info') || document.querySelector('.accordion-section')) {
        document.body.classList.add('info-page');
    }
    
    // Accordion functionality for info page
    const accordionSections = document.querySelectorAll('.accordion-section');
    
    accordionSections.forEach((section, index) => {
        section.addEventListener('click', function() {
            const isActive = this.classList.contains('active');
            
            // Close all sections
            accordionSections.forEach(s => s.classList.remove('active'));
            
            // Open clicked section if it wasn't already active
            if (!isActive) {
                this.classList.add('active');
            }
        });
        
    });
    
    // Optional: Open first section by default
    if (accordionSections.length > 0 && window.location.pathname.includes('info')) {
        // accordionSections[0].classList.add('active');
    }
    
    // Initialize carousel if on index page
    if (document.getElementById('carouselTrack')) {
        initCarousel();
    }
});

// PROJECTS DATA - Add your projects here
const projects = [
    {
        id: 'ono-mato-dada',
        title: 'Ono-Mato-Dada',
        description: 'Interactive exploration of sound and visual patterns through phoneme manipulation',
        thumbnail: 'projects/thumbnail_ono-mato-dada-v3.mov', // Video thumbnail
        link: 'projects/ono-mato-dada.html'
    },
    // Add more projects here as needed
    // {
    //     id: 'project-2',
    //     title: 'Project 2',
    //     description: 'Description of project 2',
    //     thumbnail: 'media/img/project-b/thumbnail.jpg',
    //     link: 'projects/project-2.html'
    // }
];

// CAROUSEL FUNCTIONALITY
function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicators = document.getElementById('carouselIndicators');
    
    console.log('Initializing carousel...', { track, projects: projects.length });
    
    if (!track) {
        console.error('Carousel track not found!');
        return;
    }
    
    if (projects.length === 0) {
        console.error('No projects found!');
        return;
    }
    
    let currentIndex = 0;
    
    // Generate carousel slides
    function renderCarousel() {
        track.innerHTML = '';
        indicators.innerHTML = '';
        
        console.log('Rendering', projects.length, 'projects');
        
        projects.forEach((project, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.dataset.index = index;
            
            // Check if thumbnail is a video file
            const isVideo = project.thumbnail && /\.(mp4|mov|webm|avi|m4v)$/i.test(project.thumbnail);
            
            // Detect Chrome browser
            const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
            
            let thumbnailElement = '';
            if (project.thumbnail) {
                if (isVideo) {
                    const ext = project.thumbnail.split('.').pop().toLowerCase();
                    let videoPath = project.thumbnail;
                    let videoType = 'video/mp4';
                    
                    // For .mov files in Chrome, use the pink .m4v fallback
                    if (ext === 'mov' && isChrome) {
                        videoPath = project.thumbnail.replace(/\.mov$/i, '_pink.m4v');
                        videoType = 'video/mp4'; // M4V uses MP4 codec
                    } else if (ext === 'mov') {
                        videoType = 'video/quicktime';
                    } else if (ext === 'webm') {
                        videoType = 'video/webm';
                    } else if (ext === 'avi') {
                        videoType = 'video/x-msvideo';
                    } else if (ext === 'm4v') {
                        videoType = 'video/mp4'; // M4V uses MP4 codec
                    }
                    
                    // For .mov files, add multiple source formats for better browser compatibility
                    let videoSources = '';
                    if (ext === 'mov' && isChrome) {
                        // Chrome: use M4V fallback
                        videoSources = `<source src="${videoPath}" type="${videoType}">`;
                    } else if (ext === 'mov') {
                        // Other browsers: try MP4 first, then MOV as fallback
                        const mp4Path = project.thumbnail.replace(/\.mov$/i, '.mp4');
                        videoSources = `<source src="${mp4Path}" type="video/mp4"><source src="${project.thumbnail}" type="${videoType}">`;
                    } else {
                        videoSources = `<source src="${videoPath}" type="${videoType}">`;
                    }
                    
                    thumbnailElement = `<div class="carousel-slide-image carousel-slide-video"><video autoplay loop muted playsinline preload="auto" webkit-playsinline="true">${videoSources}</video></div>`;
                } else {
                    thumbnailElement = `<div class="carousel-slide-image" style="background-image: url('${project.thumbnail}'); background-size: cover; background-position: center;"></div>`;
                }
            } else {
                thumbnailElement = '<div class="carousel-slide-image" style="background-color: #dddddd; display: flex; align-items: center; justify-content: center;"><span style="color: #888; font-family: \'IBM Plex Mono\', monospace;">No preview</span></div>';
            }
            
            const slideContent = `
                <a href="${project.link}" class="carousel-slide-link">
                    <div class="carousel-slide-content">
                        ${thumbnailElement}
                        <div class="carousel-slide-info">
                            <h3 class="carousel-slide-title">${project.title}</h3>
                            ${project.description ? `<p class="carousel-slide-description">${project.description}</p>` : ''}
                        </div>
                    </div>
                </a>
            `;
            
            slide.innerHTML = slideContent;
            track.appendChild(slide);
            
            // Set first slide as active
            if (index === 0) {
                slide.classList.add('active');
            }
            
            // Find and play video if it exists
            const video = slide.querySelector('video');
            if (video) {
                // Ensure video has all necessary attributes for autoplay
                video.setAttribute('muted', 'true');
                video.setAttribute('playsinline', 'true');
                video.muted = true;
                
                // Try to play the video
                const playVideo = () => {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(err => {
                            console.log('Video autoplay prevented:', err);
                            // If autoplay is blocked, try again on user interaction
                            const tryPlayOnInteraction = () => {
                                video.play().catch(() => {});
                                document.removeEventListener('click', tryPlayOnInteraction);
                                document.removeEventListener('touchstart', tryPlayOnInteraction);
                            };
                            document.addEventListener('click', tryPlayOnInteraction, { once: true });
                            document.addEventListener('touchstart', tryPlayOnInteraction, { once: true });
                        });
                    }
                };
                
                // Play when video is loaded
                if (video.readyState >= 2) {
                    // Video is already loaded
                    playVideo();
                } else {
                    // Wait for video to load
                    video.addEventListener('loadeddata', playVideo, { once: true });
                    video.addEventListener('canplay', playVideo, { once: true });
                    video.addEventListener('loadedmetadata', playVideo, { once: true });
                }
                
                // Play when slide becomes active
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                            if (slide.classList.contains('active')) {
                                setTimeout(playVideo, 100); // Small delay to ensure visibility
                            }
                        }
                    });
                });
                observer.observe(slide, { attributes: true });
                
                // Also use Intersection Observer to play when visible
                const intersectionObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                            playVideo();
                        }
                    });
                }, { threshold: 0.5 });
                intersectionObserver.observe(video);
            }
            
            // Create indicator
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            indicator.dataset.index = index;
            if (index === 0) {
                indicator.classList.add('active');
            }
            indicator.setAttribute('aria-label', `Go to ${project.title}`);
            indicator.addEventListener('click', () => goToSlide(index));
            indicators.appendChild(indicator);
        });
        
        console.log('Carousel rendered with', track.children.length, 'slides');
        currentIndex = 0;
        updateCarousel();
    }
    
    function updateCarousel() {
        const slides = track.querySelectorAll('.carousel-slide');
        const indicatorBtns = indicators.querySelectorAll('.carousel-indicator');
        
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentIndex);
        });
        
        indicatorBtns.forEach((btn, index) => {
            btn.classList.toggle('active', index === currentIndex);
        });
        
        // Update track position
        const slideWidth = slides[0]?.offsetWidth || 0;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }
    
    function goToSlide(index) {
        if (index < 0) {
            currentIndex = projects.length - 1;
        } else if (index >= projects.length) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }
        updateCarousel();
    }
    
    function nextSlide() {
        goToSlide(currentIndex + 1);
    }
    
    function prevSlide() {
        goToSlide(currentIndex - 1);
    }
    
    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
    
    // Touch/swipe support
    let startX = 0;
    let isDragging = false;
    
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });
    
    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });
    
    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    });
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateCarousel, 250);
    });
    
    // Initial render
    renderCarousel();
}

// Password protection for links
function passwordProtect(url) {
    const password = prompt('Enter password:');
    // Replace 'your-password-here' with your actual password
    if (password === 'twentytwentysix') {
        window.open(url, '_blank');
    } else if (password !== null) {
        alert('Incorrect password');
    }
    return false;
}

