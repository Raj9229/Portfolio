// Lazy load jsPDF only when needed
let jsPDFLoaded = false;
let jsPDFLoading = false;

function loadJsPDF() {
    return new Promise((resolve, reject) => {
        if (jsPDFLoaded) {
            resolve();
            return;
        }
        
        if (jsPDFLoading) {
            // Wait for existing load to complete
            const checkLoaded = setInterval(() => {
                if (jsPDFLoaded) {
                    clearInterval(checkLoaded);
                    resolve();
                } else if (!jsPDFLoading) {
                    clearInterval(checkLoaded);
                    reject(new Error('jsPDF failed to load'));
                }
            }, 100);
            return;
        }
        
        jsPDFLoading = true;
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            jsPDFLoaded = true;
            jsPDFLoading = false;
            window.jsPDFLoaded = true;
            resolve();
        };
        script.onerror = () => {
            // Try fallback CDN
            const fallbackScript = document.createElement('script');
            fallbackScript.src = 'https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js';
            fallbackScript.onload = () => {
                jsPDFLoaded = true;
                jsPDFLoading = false;
                window.jsPDFLoaded = true;
                resolve();
            };
            fallbackScript.onerror = () => {
                jsPDFLoading = false;
                reject(new Error('Failed to load jsPDF from all CDNs'));
            };
            document.head.appendChild(fallbackScript);
        };
        document.head.appendChild(script);
    });
}

// Loading message function
function showLoadingMessage() {
    const loadingMsg = document.createElement('div');
    loadingMsg.style.position = 'fixed';
    loadingMsg.style.top = '20px';
    loadingMsg.style.right = '20px';
    loadingMsg.style.background = '#7C3AED';
    loadingMsg.style.color = 'white';
    loadingMsg.style.padding = '10px 20px';
    loadingMsg.style.borderRadius = '8px';
    loadingMsg.style.zIndex = '9999';
    loadingMsg.style.fontSize = '14px';
    loadingMsg.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.3)';
    loadingMsg.textContent = 'Loading PDF library...';
    document.body.appendChild(loadingMsg);
    
    setTimeout(() => {
        if (loadingMsg.parentNode) {
            loadingMsg.parentNode.removeChild(loadingMsg);
        }
    }, 3000);
}

// Check if jsPDF is available
function checkjsPDFAvailability() {
    return new Promise(async (resolve) => {
        try {
            await loadJsPDF();
            resolve(true);
        } catch (error) {
            console.error('jsPDF loading failed:', error);
            resolve(false);
        }
    });
}

// Download button functionality
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.querySelector('.download-btn');
    const downloadDropdown = document.querySelector('.download-dropdown');
    const downloadPdfBtn = document.getElementById('download-pdf');
    
    // PDF Download functionality
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Show loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
            this.style.pointerEvents = 'none';
            
            try {
                await generatePDF();
            } catch (error) {
                console.error('PDF generation error:', error);
                alert('Error generating PDF. Please try again.');
            } finally {
                // Restore button state
                this.innerHTML = originalText;
                this.style.pointerEvents = 'auto';
            }
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const options = downloadDropdown.querySelector('.download-options');
            const isVisible = options.style.opacity === '1';
            
            if (isVisible) {
                options.style.opacity = '0';
                options.style.visibility = 'hidden';
                options.style.transform = 'translateY(-10px)';
            } else {
                options.style.opacity = '1';
                options.style.visibility = 'visible';
                options.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (downloadDropdown && !downloadDropdown.contains(e.target)) {
            const options = downloadDropdown.querySelector('.download-options');
            if (options) {
                options.style.opacity = '0';
                options.style.visibility = 'hidden';
                options.style.transform = 'translateY(-10px)';
            }
        }
    });
});

// PDF Generation Function
async function generatePDF() {
    // Check if jsPDF is available
    const isAvailable = await checkjsPDFAvailability();
    
    if (!isAvailable) {
        // Fallback: create a simple text file with resume content
        createTextResumeFallback();
        return;
    }
    
    // Get jsPDF constructor - try multiple possible locations
    let jsPDF;
    
    if (window.jsPDF && window.jsPDF.jsPDF) {
        jsPDF = window.jsPDF.jsPDF;
    } else if (window.jsPDF) {
        jsPDF = window.jsPDF;
    } else if (typeof window.jsPDF !== 'undefined') {
        jsPDF = window.jsPDF;
    } else {
        createTextResumeFallback();
        return;
    }
    
    const doc = new jsPDF();    // Set font
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text('RAJ GUPTA', 105, 30, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139); // Gray color
    doc.text('Web Developer & Cybersecurity Enthusiast', 105, 40, { align: 'center' });
    
    // Contact Info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Email: rajgupta807633@gmail.com', 105, 50, { align: 'center' });
    doc.text('GitHub: github.com/Raj9229 | LinkedIn: linkedin.com/in/rajgupta123', 105, 57, { align: 'center' });
    
    // Line separator
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 65, 190, 65);
    
    let yPosition = 80;
    
    // Professional Summary
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('PROFESSIONAL SUMMARY', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const summaryText = "Passionate Web Developer and Cybersecurity Enthusiast with a strong foundation in building secure, scalable web applications. Expertise spans across full-stack development and cybersecurity, creating solutions that are both functional and secure.";
    const splitSummary = doc.splitTextToSize(summaryText, 170);
    doc.text(splitSummary, 20, yPosition);
    yPosition += splitSummary.length * 5 + 10;
    
    // Technical Skills
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('TECHNICAL SKILLS', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('• Web Development: JavaScript, React, Tailwind CSS, FastAPI, SQLAlchemy, APIs', 20, yPosition);
    yPosition += 6;
    doc.text('• Cybersecurity: Nmap, Burp Suite, Wireshark, Penetration Testing', 20, yPosition);
    yPosition += 6;
    doc.text('• Data & Tools: Python, Data Analysis, MongoDB, Git', 20, yPosition);
    yPosition += 15;
    
    // Professional Experience
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('PROFESSIONAL EXPERIENCE', 20, yPosition);
    yPosition += 10;
    
    // Experience 1
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('Web Development Intern', 20, yPosition);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('May 2025 – Present', 150, yPosition);
    yPosition += 6;
    
    doc.setTextColor(0, 0, 0);
    doc.text('International Institute of SDGs & Public Policy', 20, yPosition);
    yPosition += 6;
    
    doc.setFontSize(9);
    doc.text('• Developing responsive web applications focused on sustainable development goals', 20, yPosition);
    yPosition += 4;
    doc.text('• Collaborating with cross-functional teams to create user-friendly interfaces', 20, yPosition);
    yPosition += 4;
    doc.text('• Implementing best practices in web development', 20, yPosition);
    yPosition += 10;
    
    // Experience 2
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('Cybersecurity Intern', 20, yPosition);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Mar 2024 – Aug 2024', 150, yPosition);
    yPosition += 6;
    
    doc.setTextColor(0, 0, 0);
    doc.text('Cyberent Cube', 20, yPosition);
    yPosition += 6;
    
    doc.setFontSize(9);
    doc.text('• Gained hands-on experience in penetration testing and vulnerability assessment', 20, yPosition);
    yPosition += 4;
    doc.text('• Worked with industry-standard security tools', 20, yPosition);
    yPosition += 4;
    doc.text('• Identified and mitigated security risks in web applications', 20, yPosition);
    yPosition += 10;
    
    // Key Projects
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('KEY PROJECTS', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Project 1
    doc.setTextColor(37, 99, 235);
    doc.text('Skywings:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    const project1Text = "Full-stack flight booking application with JWT authentication and MongoDB integration.";
    const splitProject1 = doc.splitTextToSize(project1Text, 140);
    doc.text(splitProject1, 35, yPosition);
    yPosition += splitProject1.length * 4 + 3;
    
    // Project 2
    doc.setTextColor(37, 99, 235);
    doc.text('Video Consultation App:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    const project2Text = "Flask-based real-time video consultation platform with integrated chat.";
    const splitProject2 = doc.splitTextToSize(project2Text, 120);
    doc.text(splitProject2, 55, yPosition);
    yPosition += splitProject2.length * 4 + 3;
    
    // Project 3
    doc.setTextColor(37, 99, 235);
    doc.text('AI Image Enhancer:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    const project3Text = "React-based image enhancement tool powered by AI APIs.";
    const splitProject3 = doc.splitTextToSize(project3Text, 130);
    doc.text(splitProject3, 50, yPosition);
    yPosition += splitProject3.length * 4 + 3;
    
    // Project 4
    doc.setTextColor(37, 99, 235);
    doc.text('OTPify:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    const project4Text = "Secure OTP-based authentication system with multi-factor verification.";
    const splitProject4 = doc.splitTextToSize(project4Text, 140);
    doc.text(splitProject4, 32, yPosition);
    yPosition += splitProject4.length * 4 + 10;
    
    // Achievements
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('ACHIEVEMENTS', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('✓ 15+ Projects Completed    ✓ 2+ Years Experience    ✓ 100% Client Satisfaction', 20, yPosition);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Generated from portfolio website - rajgupta807633@gmail.com', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save('Raj_Gupta_Resume.pdf');
    
    // Show success message
    showNotification('Resume PDF downloaded successfully!', 'success');
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]:not([href*="mailto:"]):not([href*="http"])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Only prevent default for internal section links
        if (this.getAttribute('href').startsWith('#') && this.getAttribute('href').length > 1) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Add active class to navigation links based on scroll position
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Elements to animate
const animateElements = document.querySelectorAll(
    '.hero-content, .about-text, .highlight-item, .skill-category, .project-card, .timeline-item, .contact-item'
);

animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Typing effect for hero title
function typeWriter() {
    const titleElement = document.querySelector('.hero-title');
    const text = titleElement.innerHTML;
    titleElement.innerHTML = '';
    
    let i = 0;
    function type() {
        if (i < text.length) {
            titleElement.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 50);
        }
    }
    
    // Start typing after a short delay
    setTimeout(type, 500);
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    typeWriter();
});

// Add scroll-based navbar background
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Skill progress animation
function animateSkills() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.transform = 'translateX(0)';
            item.style.opacity = '1';
        }, index * 100);
    });
}

// Initialize skill animation when skills section is visible
const skillsSection = document.querySelector('#skills');
const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateSkills();
            skillsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

if (skillsSection) {
    skillsObserver.observe(skillsSection);
}

// Project card hover effects
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Contact form validation and enhancement
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Create mailto URL
        const mailtoUrl = `mailto:rajgupta807633@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
        
        // Open email client
        window.location.href = mailtoUrl;
        
        // Show success message
        showNotification('Email client opened! Please send the email from your email application.', 'success');
        
        // Reset form
        this.reset();
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#2563eb'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Lazy loading for images (if any are added later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add smooth scrolling polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    import('https://unpkg.com/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js')
        .then(() => {
            window.__forceSmoothScrollPolyfill__ = true;
            window.smoothscroll.polyfill();
        });
}

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
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

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    // Any scroll-based functionality
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.toString() === konamiSequence.toString()) {
        showNotification('🎉 Konami Code activated! You found the easter egg!', 'success');
        // Add some fun animation
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// Add rainbow animation styles for easter egg
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Text Resume Fallback Function
function createTextResumeFallback() {
    const resumeContent = `RAJ GUPTA
Web Developer & Cybersecurity Enthusiast

CONTACT INFORMATION
Email: rajgupta807633@gmail.com
GitHub: github.com/Raj9229
LinkedIn: linkedin.com/in/rajgupta123

PROFESSIONAL SUMMARY
I'm a passionate Web Developer and Cybersecurity Enthusiast with a strong foundation in building secure, scalable web applications. My expertise spans across full-stack development and cybersecurity, allowing me to create solutions that are not only functional but also secure.

TECHNICAL SKILLS
• Web Development: JavaScript, React, Tailwind CSS, FastAPI, SQLAlchemy, APIs
• Cybersecurity: Nmap, Burp Suite, Wireshark, Penetration Testing
• Data & Analysis: Python, MongoDB, Git, Data Analysis

PROFESSIONAL EXPERIENCE

Web Development Intern | May 2025 – Present
International Institute of SDGs & Public Policy
• Working on developing responsive web applications focused on sustainable development goals
• Collaborating with cross-functional teams to create user-friendly interfaces
• Implementing best practices in web development

Cybersecurity Intern | Mar 2024 – Aug 2024
Cyberent Cube
• Gained hands-on experience in penetration testing, vulnerability assessment, and security auditing
• Worked with industry-standard tools to identify and mitigate security risks
• Conducted security assessments for web applications and network infrastructure

FEATURED PROJECTS

Skywings
Full-stack flight booking application with JWT authentication and MongoDB integration.
Technologies: React, Node.js, MongoDB, JWT

Video Consultation App
Flask-based real-time video consultation platform with integrated chat functionality.
Technologies: Flask, WebRTC, Socket.IO, Python

AI Image Enhancer
React-based image enhancement tool powered by AI APIs with real-time preview.
Technologies: React, AI API, Canvas, CSS3

OTPify
Secure OTP-based authentication system with multi-factor verification.
Technologies: Node.js, Express, MongoDB, SMS API

ACHIEVEMENTS
• 15+ Projects Completed
• 2+ Years Experience
• 100% Client Satisfaction
• Continuous Learning Mindset

STATUS
Currently seeking full-time opportunities in Web Development and Cybersecurity.
Open to remote work and relocation.`;

    // Create and download the text file
    const blob = new Blob([resumeContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Raj_Gupta_Resume.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Show notification
    showNotification('PDF library unavailable. Downloaded text resume instead!', 'info');
}
