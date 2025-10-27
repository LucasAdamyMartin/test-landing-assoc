/* =================================
   PWL - Association de Powerlifting
   Script JavaScript principal
   ================================= */

// Utility: Throttle function pour optimiser les performances
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {

    // ======================
    // Navigation mobile
    // ======================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu mobile
    navToggle.addEventListener('click', function() {
        const isOpen = navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', isOpen);
        navToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation');
    });

    // Fermer le menu mobile lors du clic sur un lien
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Ouvrir le menu de navigation');
        });
    });

    // ======================
    // Smooth scrolling
    // ======================
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            // Vérifier si c'est un lien d'ancrage (commence par #)
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80; // 80px pour la hauteur de la navbar

                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
            // Sinon, laisser le comportement par défaut (liens externes)
        });
    });

    // ======================
    // Scroll Event Optimisé (regroupé avec throttle)
    // ======================
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('.section, .hero');
    const hero = document.querySelector('.hero');

    const handleScroll = throttle(function() {
        const currentScroll = window.pageYOffset;

        // 1. Navbar au scroll
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // 2. Active link au scroll
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (currentScroll >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ======================
    // Animations désactivées
    // ======================
    // Les animations au scroll ont été retirées pour de meilleures performances

    // ======================
    // Boutons interactifs
    // ======================
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Créer effet ripple
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);

            // Action selon le bouton
            const buttonText = this.textContent.trim().toLowerCase();

            if (buttonText.includes('réserver')) {
                console.log('Redirection vers réservation (à implémenter)');
                // Placeholder pour future intégration
                showNotification('Fonctionnalité de réservation à venir !');
            } else if (buttonText.includes('découvrir')) {
                // Scroll vers section "Notre Esprit"
                const espritSection = document.getElementById('esprit');
                if (espritSection) {
                    window.scrollTo({
                        top: espritSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            } else if (buttonText.includes('contacter')) {
                console.log('Redirection vers contact (à implémenter)');
                showNotification('Formulaire de contact à venir !');
            } else if (buttonText.includes('membre')) {
                console.log('Redirection vers inscription (à implémenter)');
                showNotification('Formulaire d\'inscription à venir !');
            }
        });
    });

    // ======================
    // Notification temporaire
    // ======================
    function showNotification(message) {
        // Vérifier si une notification existe déjà
        const existingNotif = document.querySelector('.notification');
        if (existingNotif) {
            existingNotif.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
            z-index: 10000;
            animation: slideInRight 0.5s ease;
            font-weight: 600;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }


    // ======================
    // Slider Événements avec Autoplay
    // ======================
    const sliderTrack = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');
    const leftArrow = document.querySelector('.slider-arrow-left');
    const rightArrow = document.querySelector('.slider-arrow-right');
    const dotsContainer = document.querySelector('.slider-dots');

    if (sliderTrack && slides.length > 0) {
        let currentIndex = 0;
        let autoplayInterval;
        const autoplayDelay = 8000; // 8 secondes
        let slidesToShow = getSlidesToShow();

        // Calculer le nombre de slides visibles selon la taille d'écran
        function getSlidesToShow() {
            const width = window.innerWidth;
            if (width >= 768) return 2;   // Desktop & Tablet: 2 cards
            return 1;                      // Mobile: 1 card
        }

        // Calculer la largeur des slides dynamiquement
        function updateSlideWidths() {
            slidesToShow = getSlidesToShow();
            updateSliderPosition();
            updateDots();
        }

        // Créer les dots de navigation
        function createDots() {
            slidesToShow = getSlidesToShow(); // Recalculer avant de créer les dots
            const totalDots = Math.max(1, slides.length - slidesToShow + 1);
            dotsContainer.innerHTML = '';

            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('button');
                dot.classList.add('slider-dot');
                dot.setAttribute('aria-label', `Aller à la slide ${i + 1}`);
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }

        // Mettre à jour les dots
        function updateDots() {
            const dots = document.querySelectorAll('.slider-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        // Aller à une slide spécifique
        function goToSlide(index) {
            const maxIndex = Math.max(0, slides.length - slidesToShow);
            currentIndex = Math.max(0, Math.min(index, maxIndex));
            updateSliderPosition();
            updateDots();
            resetAutoplay();
        }

        // Mettre à jour la position du slider
        function updateSliderPosition() {
            const firstSlide = slides[0];
            if (!firstSlide) return;

            const slideWidth = firstSlide.offsetWidth;
            const gap = 32;
            const offset = -(currentIndex * (slideWidth + gap));
            sliderTrack.style.transform = `translateX(${offset}px)`;
        }

        // Navigation suivante
        function nextSlide() {
            const maxIndex = Math.max(0, slides.length - slidesToShow);
            if (currentIndex < maxIndex) {
                goToSlide(currentIndex + 1);
            } else {
                goToSlide(0); // Boucle au début
            }
        }

        // Navigation précédente
        function prevSlide() {
            if (currentIndex > 0) {
                goToSlide(currentIndex - 1);
            } else {
                goToSlide(Math.max(0, slides.length - slidesToShow)); // Boucle à la fin
            }
        }

        // Démarrer l'autoplay
        function startAutoplay() {
            autoplayInterval = setInterval(nextSlide, autoplayDelay);
        }

        // Arrêter l'autoplay
        function stopAutoplay() {
            clearInterval(autoplayInterval);
        }

        // Réinitialiser l'autoplay
        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        // Event listeners
        if (leftArrow) {
            leftArrow.addEventListener('click', prevSlide);
        }

        if (rightArrow) {
            rightArrow.addEventListener('click', nextSlide);
        }

        // Pause autoplay au hover
        sliderTrack.parentElement.parentElement.addEventListener('mouseenter', stopAutoplay);
        sliderTrack.parentElement.parentElement.addEventListener('mouseleave', startAutoplay);

        // Gestion du redimensionnement
        let resizeSliderTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeSliderTimer);
            resizeSliderTimer = setTimeout(() => {
                createDots(); // Recréer les dots selon la nouvelle taille
                updateSlideWidths();
            }, 250);
        });

        // Support du swipe sur mobile
        let touchStartX = 0;
        let touchEndX = 0;

        sliderTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderTrack.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchStartX - touchEndX > swipeThreshold) {
                nextSlide(); // Swipe gauche
            } else if (touchEndX - touchStartX > swipeThreshold) {
                prevSlide(); // Swipe droite
            }
        }

        // Navigation clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        });

        // Initialisation
        createDots();
        updateSlideWidths();
        startAutoplay();

        console.log('Slider initialisé avec', slides.length, 'slides');
    }

    // ======================
    // FAQ Accordion
    // ======================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function() {
            // Fermer tous les autres items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle l'item actuel
            item.classList.toggle('active');
        });
    });

    // ======================
    // Animations CSS dynamiques
    // ======================
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }

        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }

        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        .nav-link.active {
            color: var(--color-primary);
        }

        .nav-link.active::after {
            width: 100%;
        }
    `;
    document.head.appendChild(style);

    // ======================
    // Gestion du redimensionnement
    // ======================
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Fermer le menu mobile si ouvert lors du redimensionnement
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Ouvrir le menu de navigation');
            }
        }, 250);
    });

    // ======================
    // Préchargement des images (si nécessaire)
    // ======================
    function preloadImages() {
        // Ajouter ici les URLs des images à précharger
        const imageUrls = [
            // 'images/hero-bg.jpg',
            // 'images/team-1.jpg',
            // etc.
        ];

        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    // preloadImages(); // Décommenter quand les images seront ajoutées

    // ======================
    // Accessibilité - Navigation au clavier
    // ======================
    buttons.forEach(button => {
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // ======================
    // Console log pour debug
    // ======================
    console.log('PWL Website - JavaScript chargé avec succès ✓');
    console.log('Version: 1.0.0');
    console.log('Sections détectées:', sections.length);

});
