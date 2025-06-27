// Global Variables
let currentSection = 0;
const sections = document.querySelectorAll(".section");
let isScrolling = false;
let scrollTimeout;

// Initialize on DOM Content Loaded
document.addEventListener("DOMContentLoaded", function () {
  // Show loading screen initially
  showLoadingScreen();

  // Initialize portfolio after loading
  setTimeout(() => {
    initializePortfolio();
    setupEventListeners();
    setupIntersectionObserver();
    setupSmoothScrolling();
    animateOnLoad();
    hideLoadingScreen();
  }, 3000);
});

// Initialize Portfolio
function initializePortfolio() {
  // Set initial section visibility and preload first section
  sections.forEach((section, index) => {
    if (index === 0) {
      section.classList.add("visible");
      preloadSectionContent(0);
    }
  });

  // Preload next section for smoother transitions
  if (sections.length > 1) {
    setTimeout(() => {
      preloadSectionContent(1);
    }, 500);
  }

  // Update navigation
  updateNavigation();

  // Add loading animation to elements
  addLoadingAnimations();
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", handleNavClick);
  });

  // Mobile bottom navigation
  const mobileNavItems = document.querySelectorAll(".mobile-nav-item");
  mobileNavItems.forEach((item) => {
    item.addEventListener("click", handleMobileNavClick);
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", toggleMobileMenu);

    // Close mobile menu when clicking on nav links
    const mobileNavLinks = document.querySelectorAll(".mobile-nav");
    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", handleNavClick);
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !mobileMenu.contains(e.target) &&
        !menuToggle.contains(e.target) &&
        !mobileMenu.classList.contains("hidden")
      ) {
        mobileMenu.classList.add("hidden");
      }
    });

    // Close mobile menu on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.add("hidden");
      }
    });
  }

  // Scroll indicator
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      scrollToSection(1);
    });
  }

  // Contact form
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactForm);
  }

  // Keyboard navigation
  document.addEventListener("keydown", handleKeyboardNavigation);

  // Touch events are now handled by the enhanced touch handling at the bottom of the file
}

// Handle Navigation Click
function handleNavClick(e) {
  e.preventDefault();

  // Close mobile menu if open
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
    mobileMenu.classList.add("hidden");
  }

  const sectionIndex = parseInt(e.target.getAttribute("data-section"));
  if (!isNaN(sectionIndex)) {
    scrollToSection(sectionIndex);
  }
}

// Handle Mobile Navigation Click
function handleMobileNavClick(e) {
  e.preventDefault();
  const sectionIndex =
    parseInt(e.target.getAttribute("data-section")) ||
    parseInt(e.target.closest(".mobile-nav-item").getAttribute("data-section"));
  if (!isNaN(sectionIndex)) {
    scrollToSection(sectionIndex);
  }
}

// Toggle Mobile Menu
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) {
    mobileMenu.classList.toggle("hidden");
  }
}

// Handle Contact Form
function handleContactForm(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  // Simulate form submission
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Message Sent!';
    submitBtn.classList.add("bg-green-600");

    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      submitBtn.classList.remove("bg-green-600");
      e.target.reset();
    }, 2000);
  }, 1500);

  console.log("Form submitted:", data);
}

// Handle Keyboard Navigation
function handleKeyboardNavigation(e) {
  switch (e.key) {
    case "ArrowDown":
    case "PageDown":
      e.preventDefault();
      navigateToSection(currentSection + 1);
      break;
    case "ArrowUp":
    case "PageUp":
      e.preventDefault();
      navigateToSection(currentSection - 1);
      break;
    case "Home":
      e.preventDefault();
      scrollToSection(0);
      break;
    case "End":
      e.preventDefault();
      scrollToSection(sections.length - 1);
      break;
  }
}

// Handle Wheel Scroll - Allow free scrolling
function handleWheelScroll(e) {
  // Allow natural scrolling behavior
  // Only use section navigation when explicitly requested via keyboard shortcuts
  return;
}

// Navigate to Section
function navigateToSection(index) {
  if (index >= 0 && index < sections.length && index !== currentSection) {
    scrollToSection(index);
  }
}

// Scroll to Section with smooth navigation
function scrollToSection(index) {
  if (index < 0 || index >= sections.length) return;

  currentSection = index;

  // Calculate scroll position accounting for fixed navbar
  const targetSection = sections[index];
  const navbar = document.querySelector("nav");
  const navbarHeight = navbar ? navbar.offsetHeight : 80;

  // Use proper offset for navbar
  const offset = index === 0 ? 0 : navbarHeight + 20;
  const targetPosition = targetSection.offsetTop - offset;

  // Use smooth scroll
  window.scrollTo({
    top: Math.max(0, targetPosition),
    behavior: "smooth",
  });

  // Update navigation
  updateNavigation();
}

// Update Navigation
function updateNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link, index) => {
    link.classList.remove("active");
    if (parseInt(link.getAttribute("data-section")) === currentSection) {
      link.classList.add("active");
    }
  });
}

// Setup Intersection Observer with improved loading
function setupIntersectionObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const sectionIndex = Array.from(sections).indexOf(entry.target);

        if (entry.isIntersecting) {
          // Preload content immediately when section becomes visible
          preloadSectionContent(sectionIndex);

          // Update current section based on scroll position
          currentSection = sectionIndex;
          updateNavigation();

          // Add visible class with transition
          entry.target.classList.add("visible");

          // Always animate elements when they come into view
          setTimeout(() => {
            animateSectionElements(sectionIndex);
          }, 100);
        }
      });
    },
    {
      threshold: 0.5,
      rootMargin: "0px",
    }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });
}

// Setup Smooth Scrolling
function setupSmoothScrolling() {
  // Add smooth scrolling behavior to all anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    // Skip if already has data-section attribute (handled by navigation)
    if (!anchor.hasAttribute("data-section")) {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          const navbar = document.querySelector("nav");
          const navbarHeight = navbar ? navbar.offsetHeight : 80;
          const targetPosition = target.offsetTop - navbarHeight - 20;

          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: "smooth",
          });
        }
      });
    }
  });
}

// Animate Section Elements
function animateSectionElements(sectionIndex) {
  const section = sections[sectionIndex];
  const elements = section.querySelectorAll(
    ".glass-card, .skill-category, .project-card, .stat-card"
  );

  elements.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";

    setTimeout(() => {
      element.style.transition = "all 0.6s ease";
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }, index * 100 + 200);
  });
}

// Add Loading Animations
function addLoadingAnimations() {
  const elements = document.querySelectorAll("h1, h2, h3, p, .cyber-btn");
  elements.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";

    setTimeout(() => {
      element.style.transition = "all 0.8s ease";
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }, index * 50);
  });
}

// Animate on Load
function animateOnLoad() {
  // Animate hero section elements
  const heroElements = document.querySelectorAll(
    "#home h1, #home p, #home .cyber-btn"
  );
  heroElements.forEach((element, index) => {
    element.classList.add("fade-in");
    element.style.animationDelay = `${index * 0.2}s`;
  });

  // Animate navigation
  const nav = document.querySelector("nav");
  if (nav) {
    nav.style.opacity = "0";
    nav.style.transform = "translateY(-50px)";

    setTimeout(() => {
      nav.style.transition = "all 0.8s ease";
      nav.style.opacity = "1";
      nav.style.transform = "translateY(0)";
    }, 500);
  }
}

// Utility Functions
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

function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Parallax Effect
window.addEventListener(
  "scroll",
  throttle(() => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll(".orb");

    parallaxElements.forEach((element, index) => {
      const speed = 0.5 + index * 0.1;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }, 10)
);

// Resize Handler
window.addEventListener(
  "resize",
  debounce(() => {
    // Recalculate positions and update layout
    updateNavigation();
  }, 250)
);

// Preload Critical Resources
function preloadResources() {
  // Preload fonts
  const fontPreload = document.createElement("link");
  fontPreload.rel = "preload";
  fontPreload.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
  fontPreload.as = "style";
  document.head.appendChild(fontPreload);
}

// Initialize preloading
preloadResources();

// Performance Monitoring
function trackPerformance() {
  if ("performance" in window) {
    window.addEventListener("load", () => {
      const loadTime =
        performance.timing.loadEventEnd - performance.timing.navigationStart;
      console.log(`Page loaded in ${loadTime}ms`);
    });
  }
}

trackPerformance();

// Accessibility Enhancements
function enhanceAccessibility() {
  // Add ARIA labels to interactive elements
  const interactiveElements = document.querySelectorAll(
    ".cyber-btn, .nav-link, .social-link"
  );
  interactiveElements.forEach((element) => {
    if (!element.getAttribute("aria-label")) {
      element.setAttribute("aria-label", element.textContent.trim());
    }
  });

  // Add focus indicators
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      document.body.classList.add("keyboard-navigation");
    }
  });

  document.addEventListener("mousedown", () => {
    document.body.classList.remove("keyboard-navigation");
  });
}

enhanceAccessibility();

// Error Handling
window.addEventListener("error", (e) => {
  console.error("Portfolio Error:", e.error);
});

// Service Worker Registration (for PWA capabilities)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Service worker could be registered here for offline capabilities
    console.log("Portfolio loaded and ready");
  });
}

// Preload Section Content to prevent loading delays
function preloadSectionContent(sectionIndex) {
  const section = sections[sectionIndex];
  if (!section) return;

  // Force browser to calculate layout and render elements
  const elements = section.querySelectorAll(
    "img, .glass-card, .skill-category, .project-card, .stat-card"
  );
  elements.forEach((element) => {
    // Trigger reflow to ensure elements are ready
    element.offsetHeight;

    // Preload any background images
    const computedStyle = getComputedStyle(element);
    if (
      computedStyle.backgroundImage &&
      computedStyle.backgroundImage !== "none"
    ) {
      const img = new Image();
      img.src = computedStyle.backgroundImage.slice(5, -2); // Remove 'url("...")' wrapper
    }
  });

  // Ensure fonts are loaded
  if (document.fonts) {
    document.fonts.ready.then(() => {
      // Fonts are loaded, trigger any text measurements
      section.querySelectorAll("h1, h2, h3, p").forEach((textElement) => {
        textElement.offsetHeight;
      });
    });
  }
}

// Improved Handle Wheel Scroll with debouncing
function handleWheelScroll(e) {
  e.preventDefault();

  if (isScrolling) {
    return;
  }

  clearTimeout(scrollTimeout);

  // Use more sensitive threshold for better responsiveness
  const threshold = Math.abs(e.deltaY) > 50 ? 50 : 150;

  scrollTimeout = setTimeout(() => {
    if (e.deltaY > 0) {
      navigateToSection(currentSection + 1);
    } else {
      navigateToSection(currentSection - 1);
    }
  }, threshold);
}

// Enhanced Navigation Update with visual feedback
function updateNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link, index) => {
    link.classList.remove("active");
    if (parseInt(link.getAttribute("data-section")) === currentSection) {
      link.classList.add("active");

      // Add visual feedback
      link.style.transform = "scale(1.05)";
      setTimeout(() => {
        link.style.transform = "";
      }, 200);
    }
  });

  // Update mobile bottom navigation
  updateMobileNavigation();
}

// Update Mobile Navigation
function updateMobileNavigation() {
  const mobileNavItems = document.querySelectorAll(".mobile-nav-item");
  mobileNavItems.forEach((item, index) => {
    item.classList.remove("active");
    if (parseInt(item.getAttribute("data-section")) === currentSection) {
      item.classList.add("active");
    }
  });
}

// Optimize Animate Section Elements
function animateSectionElements(sectionIndex) {
  const section = sections[sectionIndex];
  if (!section) return;

  const elements = section.querySelectorAll(
    ".glass-card, .skill-category, .project-card, .stat-card"
  );

  // Reset all elements first
  elements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
  });

  // Use requestAnimationFrame for better performance
  requestAnimationFrame(() => {
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.style.transition =
          "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }, index * 100 + 200);
    });
  });
}

// Enhanced mobile touch handling
let touchStartY = 0;
let touchStartTime = 0;
let isTouchScrolling = false;
let lastScrollTime = 0;
let manualScrolling = false;

// Detect manual scrolling
function isManuallyScrolling() {
  return manualScrolling || Date.now() - lastScrollTime < 1000;
}

// Track manual scroll events
window.addEventListener(
  "scroll",
  () => {
    if (!isScrolling) {
      manualScrolling = true;
      lastScrollTime = Date.now();

      // Reset manual scrolling flag after a delay
      clearTimeout(window.manualScrollTimeout);
      window.manualScrollTimeout = setTimeout(() => {
        manualScrolling = false;
      }, 500);
    }
  },
  { passive: true }
);

document.addEventListener(
  "touchstart",
  (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    isTouchScrolling = false;
  },
  { passive: true }
);

document.addEventListener(
  "touchmove",
  (e) => {
    isTouchScrolling = true;
  },
  { passive: true }
);

document.addEventListener(
  "touchend",
  (e) => {
    if (isTouchScrolling || isScrolling) return;

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    const diff = touchStartY - touchEndY;
    const timeDiff = touchEndTime - touchStartTime;

    // Only trigger if it's a quick swipe (not a slow scroll)
    if (Math.abs(diff) > 80 && timeDiff < 300) {
      if (diff > 0) {
        navigateToSection(currentSection + 1);
      } else {
        navigateToSection(currentSection - 1);
      }
    }
  },
  { passive: true }
);

// Loading Screen Functions
function showLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.style.display = "flex";
    loadingScreen.style.opacity = "1";
    loadingScreen.style.visibility = "visible";
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.style.animation = "loading-fade-out 0.8s ease-out forwards";
  }
}

// Enhanced skill progress animation
function animateSkillProgress() {
  const progressBars = document.querySelectorAll(".progress-fill");
  progressBars.forEach((bar, index) => {
    const width = bar.style.width;
    bar.style.width = "0%";

    setTimeout(() => {
      bar.style.width = width;
    }, index * 200 + 500);
  });
}

// Optimize Animate Section Elements with skill progress
function animateSectionElements(sectionIndex) {
  const section = sections[sectionIndex];
  if (!section) return;

  const elements = section.querySelectorAll(
    ".glass-card, .skill-category-enhanced, .project-card, .stat-card, .profile-card"
  );

  // Reset all elements first
  elements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
  });

  // Use requestAnimationFrame for better performance
  requestAnimationFrame(() => {
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.style.transition =
          "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }, index * 100 + 200);
    });

    // Animate skill progress bars if in skills section
    if (sectionIndex === 2) {
      // Skills section
      setTimeout(() => {
        animateSkillProgress();
      }, 800);
    }
  });
}

// Export functions for external use
window.portfolioAPI = {
  scrollToSection,
  navigateToSection,
  currentSection: () => currentSection,
  preloadSectionContent,
  showLoadingScreen,
  hideLoadingScreen,
};
