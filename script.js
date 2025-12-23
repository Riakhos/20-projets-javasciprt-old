// JavaScript pour la navigation
function toggleMenu() {
const menu = document.getElementById('nav-menu');
menu.classList.toggle('open');
}

// Gestion des dropdowns
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        
        toggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Fermer tous les autres dropdowns
        dropdowns.forEach(other => {
            if (other !== dropdown) {
            other.classList.remove('active');
            }
        });
        
        // Toggle le dropdown actuel
        dropdown.classList.toggle('active');
        });
    });

    // Fermer les dropdowns en cliquant ailleurs
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        }
    });
});