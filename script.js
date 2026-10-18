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
    loadingMsg.style.background = '#0891b2';
    loadingMsg.style.color = 'white';
    loadingMsg.style.padding = '10px 20px';
    loadingMsg.style.borderRadius = '8px';
    loadingMsg.style.zIndex = '9999';
    loadingMsg.style.fontSize = '14px';
    loadingMsg.style.boxShadow = '0 4px 20px rgba(8, 145, 178, 0.3)';
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
document.addEventListener('DOMContentLoaded', function () {
    const downloadBtn = document.querySelector('.download-btn');
    const downloadDropdown = document.querySelector('.download-dropdown');
    const downloadPdfBtn = document.getElementById('download-pdf');

    // PDF Download functionality
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', async function (e) {
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
        downloadBtn.addEventListener('click', function (e) {
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
    document.addEventListener('click', function (e) {
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
    doc.text('Full Stack Developer | MERN, FastAPI, Security', 105, 40, { align: 'center' });

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
    const summaryText = "Full Stack Developer skilled in MERN and Python ecosystems, focused on building secure, responsive products. Hands-on experience through multiple internships and open-source development.";
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
    doc.text('• Languages: JavaScript, Python, SQL, HTML5, CSS3', 20, yPosition);
    yPosition += 6;
    doc.text('• Frontend: React, Tailwind CSS, Bootstrap, Framer Motion', 20, yPosition);
    yPosition += 6;
    doc.text('• Backend: Node.js, Express.js, FastAPI, Flask, MongoDB, MySQL', 20, yPosition);
    yPosition += 6;
    doc.text('• Security & Tools: Nmap, Burp Suite, Penetration Testing, Git/GitHub', 20, yPosition);
    yPosition += 15;

    // Professional Experience
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('PROFESSIONAL EXPERIENCE', 20, yPosition);
    yPosition += 10;

    // Experience 1
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('Full Stack Developer Trainee', 20, yPosition);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Aug 2026 – Present', 150, yPosition);
    yPosition += 6;

    doc.setTextColor(0, 0, 0);
    doc.text('ExcelR', 20, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.text('• Developing responsive frontend modules and integrating backend REST APIs', 20, yPosition);
    yPosition += 4;
    doc.text('• Strengthening practical full-stack workflows and delivery quality', 20, yPosition);
    yPosition += 4;
    doc.text('• Collaborating with mentors and team members in production-like tasks', 20, yPosition);
    yPosition += 10;

    // Experience 2
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('MERN Stack Developer Intern', 20, yPosition);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Jul 2026 – Aug 2026', 150, yPosition);
    yPosition += 6;

    doc.setTextColor(0, 0, 0);
    doc.text('Kinetrexa Software Private Limited', 20, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.text('• Built and integrated frontend and backend modules across the MERN stack', 20, yPosition);
    yPosition += 4;
    doc.text('• Collaborated on real-world development tasks and team workflows', 20, yPosition);
    yPosition += 4;
    doc.text('• Focused on quality, maintainability, and production-ready delivery', 20, yPosition);
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
    doc.text('HealthSaathi:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    const project1Text = "Telemedicine platform with AI chatbot and fast API-driven workflows.";
    const splitProject1 = doc.splitTextToSize(project1Text, 140);
    doc.text(splitProject1, 35, yPosition);
    yPosition += splitProject1.length * 4 + 3;

    // Project 2
    doc.setTextColor(37, 99, 235);
    doc.text('StealthShare:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    const project2Text = "Zero-knowledge file sharing with client-side AES encryption.";
    const splitProject2 = doc.splitTextToSize(project2Text, 120);
    doc.text(splitProject2, 55, yPosition);
    yPosition += splitProject2.length * 4 + 3;

    // Project 3
    doc.setTextColor(37, 99, 235);
    doc.text('randnamepy:', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    const project3Text = "Published zero-dependency Python package with 900+ PyPI downloads.";
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
    doc.text('✓ 15+ Projects Completed    ✓ 5+ Roles/Internships    ✓ 900+ PyPI Downloads', 20, yPosition);

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

const observer = new IntersectionObserver(function (entries) {
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
        navbar.style.background = 'rgba(3, 7, 18, 0.98)';
        navbar.style.backdropFilter = 'blur(20px)';
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    } else {
        navbar.style.background = 'rgba(3, 7, 18, 0.8)';
        navbar.style.backdropFilter = 'blur(10px)';
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
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
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Contact form validation and enhancement
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
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
Full Stack Developer | MERN, FastAPI, Security

CONTACT INFORMATION
Email: rajgupta807633@gmail.com
GitHub: github.com/Raj9229
LinkedIn: linkedin.com/in/rajgupta123

PROFESSIONAL SUMMARY
Full Stack Developer with experience building secure, scalable applications using MERN and Python ecosystems. Strong internship exposure with practical team delivery and open-source contributions.

EDUCATION
B.Tech in Computer Science | Aug 2023 – Aug 2027
J.C. Bose University of Science and Technology, YMCA

TECHNICAL SKILLS
• Languages: JavaScript, Python, SQL, HTML5, CSS3
• Frontend: React, Tailwind CSS, Bootstrap, Framer Motion
• Backend: Node.js, Express.js, FastAPI, Flask, MongoDB, MySQL
• Security & Tools: Nmap, Burp Suite, Penetration Testing, Git/GitHub

PROFESSIONAL EXPERIENCE

Full Stack Developer Trainee | Aug 2026 – Present
ExcelR
• Developing and integrating responsive frontend components with backend REST APIs

MERN Stack Developer Intern | Jul 2026 – Aug 2026
Kinetrexa Software Private Limited
• Built and integrated frontend and backend components across MongoDB, Express, React, and Node.js

Internshala Student Partner | Sep 2025 – Oct 2025
Internshala
• Promoted internships and organized student engagement initiatives

FEATURED PROJECTS

HealthSaathi
Telemedicine platform with AI chatbot and fast API-driven architecture.
Technologies: React 19, FastAPI, SQLite, Groq API

StealthShare
Zero-knowledge file sharing platform with client-side AES encryption.
Technologies: React 19, Node.js, Express, Web Crypto API

randnamepy
Published zero-dependency Python package for realistic test data generation.
Technologies: Python, pytest, PyPI

OTPify
Secure OTP-based authentication system with multi-factor verification.
Technologies: Python, Flask, SQLAlchemy, SMTP

ACHIEVEMENTS
• 15+ Projects Completed
• 5+ Internship/Trainee Roles
• 900+ PyPI Downloads on randnamepy
• Built and deployed full-stack applications across multiple domains

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
