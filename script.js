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
});

