/**
 * Fallback script for browsers that don't support ES modules
 * This will ensure the site still works and doesn't get stuck on loading
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Fallback script loaded. Your browser does not support ES modules.');
    
    // Hide loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        setTimeout(function() {
            loadingOverlay.style.opacity = '0';
            setTimeout(function() {
                loadingOverlay.style.display = 'none';
            }, 500);
        }, 500);
    }
    
    // Setup mobile menu
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const closeMenuButton = document.getElementById('closeMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuButton && mobileMenu && closeMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.remove('hidden');
        });
        
        closeMenuButton.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
        });
    }
    
    // Setup countdown timer (simplified version)
    try {
        // Set the date we're counting down to (March 27, 2025)
        var countDownDate = new Date("Mar 27, 2025 09:00:00").getTime();
        
        // Update the countdown every 1 second
        var countdownTimer = setInterval(function() {
            // Get today's date and time
            var now = new Date().getTime();
            
            // Find the distance between now and the countdown date
            var distance = countDownDate - now;
            
            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            // Update elements if they exist
            if (document.getElementById("days")) {
                document.getElementById("days").innerHTML = (days < 10 ? "0" : "") + days;
            }
            if (document.getElementById("hours")) {
                document.getElementById("hours").innerHTML = (hours < 10 ? "0" : "") + hours;
            }
            if (document.getElementById("minutes")) {
                document.getElementById("minutes").innerHTML = (minutes < 10 ? "0" : "") + minutes;
            }
            if (document.getElementById("seconds")) {
                document.getElementById("seconds").innerHTML = (seconds < 10 ? "0" : "") + seconds;
            }
            
            // If the countdown is finished, display message
            if (distance < 0) {
                clearInterval(countdownTimer);
            }
        }, 1000);
    } catch (e) {
        console.error('Countdown timer error:', e);
    }
    
    // Setup smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            var targetId = this.getAttribute('href');
            var targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Smooth scroll polyfill for older browsers
                var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 100;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Show a warning for older browsers
    showBrowserWarning();
});

function showBrowserWarning() {
    // Add a subtle warning for users with older browsers
    var warningDiv = document.createElement('div');
    warningDiv.className = 'fixed bottom-0 left-0 right-0 bg-yellow-800 bg-opacity-90 text-white text-center py-2 px-4 text-sm';
    warningDiv.innerHTML = 'You are using a browser with limited support. Some features may not work properly. <a href="https://browsehappy.com/" target="_blank" class="underline">Consider upgrading your browser</a>.';
    
    // Add to DOM after a slight delay
    setTimeout(function() {
        document.body.appendChild(warningDiv);
    }, 5000);
}
