/**
 * Aurora Solutions - Système de gestion des avis clients
 * Charge les avis depuis reviews.json et anime le carousel
 */

class ReviewsManager {
    constructor() {
        this.reviews = [];
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.init();
    }

    async init() {
        await this.loadReviews();
        this.renderReviews();
        this.initCarousel();
        this.updateAggregateRating();
    }

    async loadReviews() {
        try {
            const response = await fetch('reviews.json');
            const data = await response.json();
            this.reviews = data.reviews;
            this.googleRating = data.google_rating;
            this.totalReviews = data.total_reviews;
        } catch (error) {
            console.log('Chargement des avis statiques');
            // Fallback vers les avis statiques si reviews.json n'existe pas
        }
    }

    renderReviews() {
        const track = document.getElementById('track');
        if (!track || this.reviews.length === 0) return;

        track.innerHTML = this.reviews.map(review => `
            <div class="testimonial-card">
                <span class="review-source">Avis ${review.source}</span>
                <div class="review-stars">${this.renderStars(review.rating)}</div>
                <p class="review-text">"${review.text}"</p>
                <div class="review-author">
                    <strong>${review.author}</strong>
                    <span class="review-date">${this.formatDate(review.date)}</span>
                </div>
            </div>
        `).join('');
    }

    renderStars(rating) {
        return '⭐'.repeat(rating);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }

    updateAggregateRating() {
        const ratingElement = document.querySelector('.aggregate-rating');
        if (ratingElement && this.googleRating) {
            ratingElement.innerHTML = `⭐ ${this.googleRating}/5 (${this.totalReviews} avis)`;
        }
    }

    initCarousel() {
        const track = document.getElementById('track');
        if (!track) return;

        const cards = track.querySelectorAll('.testimonial-card');
        if (cards.length === 0) return;

        // Auto-play
        this.startAutoPlay();

        // Pause on hover
        track.addEventListener('mouseenter', () => this.stopAutoPlay());
        track.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 8000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }

    nextSlide() {
        const track = document.getElementById('track');
        const cards = track.querySelectorAll('.testimonial-card');
        const visibleCards = this.getVisibleCards();
        const maxIndex = cards.length - visibleCards;

        this.currentIndex++;
        if (this.currentIndex > maxIndex) {
            this.currentIndex = 0;
        }

        this.updateCarouselPosition();
    }

    prevSlide() {
        const track = document.getElementById('track');
        const cards = track.querySelectorAll('.testimonial-card');
        const visibleCards = this.getVisibleCards();
        const maxIndex = cards.length - visibleCards;

        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = maxIndex;
        }

        this.updateCarouselPosition();
    }

    getVisibleCards() {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    }

    updateCarouselPosition() {
        const track = document.getElementById('track');
        const cards = track.querySelectorAll('.testimonial-card');
        if (cards.length === 0) return;

        const card = cards[0];
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.gap) || 32;
        const cardWidth = card.offsetWidth + gap;
        const moveAmount = this.currentIndex * cardWidth;

        track.style.transform = `translateX(-${moveAmount}px)`;
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le gestionnaire d'avis seulement si l'élément existe
    if (document.getElementById('track')) {
        window.reviewsManager = new ReviewsManager();
    }
});

// Fonctions globales pour les boutons du carousel
function moveSlide(direction) {
    if (window.reviewsManager) {
        if (direction > 0) {
            window.reviewsManager.nextSlide();
        } else {
            window.reviewsManager.prevSlide();
        }
    }
}
