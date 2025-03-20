document.addEventListener('DOMContentLoaded', function() {
    // Get the footer element
    const footerContainer = document.getElementById('footer-container');
    
    // If the footer container exists, load the footer content
    if (footerContainer) {
        footerContainer.innerHTML = `
            <!-- Footer content -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <!-- Column 1: About -->
                <div class="glass-effect p-6 rounded-lg">
                    <div class="flex items-center mb-4">
                        <img src="/public/images/INFINITY GOLD LOGO 24.png" alt="Infinity 2025 Logo" class="h-10 w-auto mr-3">
                        <h3 class="text-xl font-semibold text-white">INFINITY-2K25</h3>
                    </div>
                    <p class="text-gray-200 mb-4">The premier techno-cultural fest organized by Faculty of Engineering and Technology, Jain (Deemed-to-be University), bringing together the brightest minds for competition, learning, and networking.</p>
                    <div class="flex items-center">
                        <a href="https://www.instagram.com/culturalclub.fet/?igsh=ZDJ5aHExd3YwOWs4#" target="_blank" class="text-purple-400 hover:text-purple-300 transition-colors flex items-center">
                            <i class="fab fa-instagram text-2xl"></i>
                            <span class="ml-2">Follow us on Instagram</span>
                        </a>
                    </div>
                </div>
                <!-- Column 2: Quick Links -->
                <div class="glass-effect p-6 rounded-lg">
                    <h3 class="text-xl font-semibold text-purple-400 mb-4">Quick Links</h3>
                    <div class="grid grid-cols-2 gap-2">
                        <a href="/index.html" class="text-gray-300 hover:text-purple-400 transition-colors font-semibold">Home</a>
                        <a href="/pages/cultural.html" class="text-gray-300 hover:text-purple-400 transition-colors">Cultural Events</a>
                        <a href="/pages/tech.html" class="text-gray-300 hover:text-purple-400 transition-colors">Tech Events</a>
                        <a href="/pages/register.html" class="text-gray-300 hover:text-purple-400 transition-colors">Register</a>
                        <a href="/pages/contact.html" class="text-gray-300 hover:text-purple-400 transition-colors">Contact Us</a>
                    </div>
                </div>
                <!-- Column 3: Contact Info -->
                <div class="glass-effect p-6 rounded-lg">
                    <h3 class="text-xl font-semibold text-purple-400 mb-4">Contact Information</h3>
                    <div class="space-y-3">
                        <p class="flex items-start">
                            <i class="fas fa-map-marker-alt mt-1 mr-3 text-purple-400"></i>
                            <span class="text-gray-200">45th km, NH - 209,Jakkasandra Post, Bengaluru - Kanakapura Rd, Bengaluru, Karnataka 562112</span>
                        </p>
                        <p class="flex items-start">
                            <i class="fas fa-envelope mt-1 mr-3 text-purple-400"></i>
                            <span class="text-gray-200">culturalclubfet.ju@gmail.com</span>
                        </p>
                        <p class="flex items-start">
                            <i class="fas fa-phone-alt mt-1 mr-3 text-purple-400"></i>
                            <span class="text-gray-200">Technical Events: Dhrub Kumar Jha (+91 8296019911)</span>
                        </p>
                        <p class="flex items-start">
                            <i class="fas fa-phone-alt mt-1 mr-3 text-purple-400"></i>
                            <span class="text-gray-200">Cultural Events: Rohan (+91 9353074448)</span>
                        </p>
                        <p class="flex items-start">
                            <i class="fas fa-calendar-alt mt-1 mr-3 text-purple-400"></i>
                            <span class="text-gray-200">March 27-28, 2025</span>
                        </p>
                    </div>
                </div>
            </div>
            <!-- Copyright -->
            <div class="border-t border-gray-800 pt-6 mt-6">
                <p class="text-center text-gray-300 mb-2">&copy; 2025 Krithik R. All rights reserved. | Designed & Developed by <a href="https://krithikr007.github.io/krithik-r/portfolio/index.html" target="_blank" class="text-purple-400 hover:text-purple-300">Krithik R.</a></p>
                <p class="text-center text-gray-400 mb-2 font-medium">Organized by Faculty of Engineering and Technology, Jain (Deemed-to-be University), Bangalore</p>
                <p class="text-center text-gray-400 mb-2">Contact: Technical Events - Dhrub Kumar Jha (+91 8296019911) | Cultural Events - Rohan (+91 9353074448)</p>
                <p class="text-center text-gray-500 text-sm">
                    <a href="https://github.com/KRITHIKR007" target="_blank" class="text-gray-500 hover:text-purple-400 transition-colors mx-2">GitHub</a> | 
                    <a href="https://www.linkedin.com/in/krithik-r124/" target="_blank" class="text-gray-500 hover:text-purple-400 transition-colors mx-2">LinkedIn</a> | 
                    <span class="text-gray-500 mx-2">Discord: krithik.r007</span>
                </p>
                <!-- No admin button in shared footer -->
            </div>
        `;
    }
});
