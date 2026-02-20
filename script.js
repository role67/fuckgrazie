// ============================================
// DOM ELEMENTS
// ============================================
// Wait for DOM to be ready
let card, avatar, avatarImg, background;
let cardObserver = null;
let initialBodyOverflow = '';

function initElements() {
  card = document.getElementById('profileCard');
  avatar = document.getElementById('avatar');
  avatarImg = document.getElementById('avatarImg');
  background = document.getElementById('background');
  
  // Initialize other functions after elements are ready
  initNumbersMode();
  setupCardFlip();
  setupAvatarClick();
  setupKeyboardNavigation();
  setupHoverEffects();
  setupSidebar();
  setupLanguageToggle();
  setupSnowToggle();
  setupSakuraToggle();
  preloadSakuraImage();
  setupIntersectionObserver();
  setupImageLoadState();

  if (window.innerWidth > 768) {
    parallaxEnabled = true;
    initParallax();
  } else {
    parallaxEnabled = false;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initElements);
} else {
  initElements();
}

let typingTimeout;
let numbersTypingTimeout = null;
let typingProgressBar = null;
let pendingNumbersTyping = false;

// ============================================
// PARALLAX EFFECT
// ============================================
let parallaxEnabled = true;
let parallaxRafId = null;
let parallaxMouseHandler = null;
let parallaxState = {
  mouseX: 0,
  mouseY: 0,
  targetX: 0,
  targetY: 0
};

function stopParallax() {
  if (parallaxMouseHandler) {
    document.removeEventListener('mousemove', parallaxMouseHandler);
    parallaxMouseHandler = null;
  }
  if (parallaxRafId !== null) {
    cancelAnimationFrame(parallaxRafId);
    parallaxRafId = null;
  }
}

function initParallax() {
  if (!parallaxEnabled || parallaxRafId !== null) return;

  parallaxState = {
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0
  };

  parallaxMouseHandler = (e) => {
    if (!parallaxEnabled) return;

    parallaxState.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    parallaxState.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  document.addEventListener('mousemove', parallaxMouseHandler, { passive: true });

  function animateParallax() {
    if (!parallaxEnabled) {
      parallaxRafId = null;
      return;
    }

    parallaxState.targetX += (parallaxState.mouseX - parallaxState.targetX) * 0.05;
    parallaxState.targetY += (parallaxState.mouseY - parallaxState.targetY) * 0.05;

    if (background) {
      const moveX = parallaxState.targetX * 20;
      const moveY = parallaxState.targetY * 20;
      background.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
    }

    parallaxRafId = requestAnimationFrame(animateParallax);
  }

  animateParallax();
}

// Disable parallax on mobile for performance
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    parallaxEnabled = false;
    stopParallax();
    if (background) {
      background.style.transform = 'none';
    }
  } else {
    parallaxEnabled = true;
    initParallax();
  }
});

// ============================================
// CARD FLIP FUNCTIONALITY
// ============================================
function setupCardFlip() {
  if (!card) return;
  
  card.addEventListener('click', function (e) {
    if (e.target.closest('#avatar') || e.target.closest('.avatar') || e.target.closest('#snowToggle')) return;
    card.classList.toggle('flipped');
    card.setAttribute('aria-expanded', String(card.classList.contains('flipped')));

    if (card.classList.contains('flipped')) {
      // Wait for fade out, then start typing
      setTimeout(() => {
        if (numbersMode) {
          startNumbersBackTyping();
        } else {
          startTyping();
        }
      }, 400);
    } else {
      const typingElement = document.getElementById('typing-text');
      if (typingElement) typingElement.textContent = '';
      clearTimeout(typingTimeout);
      clearNumbersTyping();
      pendingNumbersTyping = numbersMode;
      removeProgressBar();
      removeNumbersGlitchText();
    }
  });
}

// ============================================
// TYPING EFFECT WITH PROGRESS BAR
// ============================================
const cryptChars = 'з”°ж°ґзЃ«з©єеѕЊе‰Ќе·¦еЏідёЉдё‹!@#$%^&*!@#$%^&*'.split('');

function getRandomChar() {
  return cryptChars[Math.floor(Math.random() * cryptChars.length)];
}

function createProgressBar(targetElement = null, inline = false) {
  if (typingProgressBar) return;
  
  const parent = targetElement || document.querySelector('.card');
  if (!parent) return;
  
  typingProgressBar = document.createElement('div');
  typingProgressBar.className = inline ? 'typing-progress typing-progress-inline' : 'typing-progress';
  parent.appendChild(typingProgressBar);
}

function removeProgressBar() {
  if (typingProgressBar) {
    typingProgressBar.remove();
    typingProgressBar = null;
  }
}

function updateProgressBar(progress) {
  if (typingProgressBar) {
    if (typingProgressBar.classList.contains('typing-progress-inline')) {
      typingProgressBar.style.width = `${progress}%`;
      return;
    }
    const card = document.querySelector('.card');
    if (card) {
      const cardWidth = card.offsetWidth;
      const maxWidth = cardWidth - 24; // 12px margin on each side
      const width = (progress / 100) * maxWidth;
      typingProgressBar.style.width = `${width}px`;
    }
  }
}

function startTyping() {
  // Re-find typingText element in case it wasn't found initially
  const typingElement = document.getElementById('typing-text');
  if (!typingElement) {
    console.warn('typing-text element not found');
    return;
  }
  
  // Get current language content
  const lang = isEnglish ? 'en' : 'ru';
  const currentContent = translations[lang].typingContent;
  
  clearTimeout(typingTimeout);
  removeProgressBar();
  typingElement.textContent = '';
  createProgressBar(document.querySelector('.card'), false);
  
  let i = 0;
  let finalText = '';
  let scrambleLength = 5;
  const totalLength = currentContent.length;

  function scramble() {
    if (i < currentContent.length) {
      finalText = finalText + currentContent[i];
      let currentText = finalText;
      
      for (let j = 0; j < scrambleLength; j++) {
        currentText += getRandomChar();
      }
      
      typingElement.textContent = currentText;
      
      // Update progress bar
      const progress = ((i + 1) / totalLength) * 100;
      updateProgressBar(progress);
      
      i++;

      typingTimeout = setTimeout(() => {
        requestAnimationFrame(scramble);
      }, 15);
    } else {
      typingElement.textContent = finalText;
      updateProgressBar(100);
      
      // Remove progress bar after completion
      setTimeout(() => {
        if (typingProgressBar) {
          typingProgressBar.style.opacity = '0';
          setTimeout(removeProgressBar, 300);
        }
      }, 500);
    }
  }
  
  scramble();
}

function clearNumbersTyping() {
  if (numbersTypingTimeout) {
    clearTimeout(numbersTypingTimeout);
    numbersTypingTimeout = null;
  }
}

function removeNumbersGlitchText() {
  const cardBack = document.querySelector('.card-back');
  if (!cardBack) return;
  const oldGlitch = cardBack.querySelector('.numbers-glitch-text');
  if (oldGlitch) oldGlitch.remove();
}

function startNumbersBackTyping() {
  if (!numbersMode || !card || !card.classList.contains('flipped')) return;

  const cardBack = document.querySelector('.card-back');
  if (!cardBack) return;

  clearTimeout(typingTimeout);
  clearNumbersTyping();
  removeProgressBar();

  const existingTypingText = document.getElementById('typing-text');
  if (existingTypingText) {
    existingTypingText.textContent = '';
    existingTypingText.style.display = 'none';
  }

  removeNumbersGlitchText();

  const mainText = `Мы помним всех, кто был с нами - тех, кто поддерживал в трудные моменты и не отвернулся, а помог, как мог. Спасибо вам за всё хорошее, за время, проведённое вместе. Даже если вы этого не прочтёте, мы искренне желаем вам всего наилучшего. Мы помним и тех, кто был против нас - и вам тоже желаем добра. Спасибо за всё.`;
  const signText = `309sq. 2022-2024`;

  const container = document.createElement('div');
  container.className = 'numbers-glitch-text';

  const textContainer = document.createElement('div');
  textContainer.className = 'main-text';
  container.appendChild(textContainer);

  createProgressBar(document.querySelector('.card'), false);

  const signContainer = document.createElement('div');
  signContainer.className = 'sign-text';
  container.appendChild(signContainer);
  cardBack.appendChild(container);

  let mainI = 0;
  const totalLength = mainText.length;
  pendingNumbersTyping = false;

  function glitchType() {
    if (!numbersMode || !card || !card.classList.contains('flipped')) return;

    if (mainI < mainText.length) {
      const finalText = mainText.slice(0, mainI);
      let currentText = finalText;

      const scrambleLength = 5 + Math.floor(Math.random() * 3);
      for (let j = 0; j < scrambleLength; j++) {
        currentText += String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
      }

      textContainer.innerHTML = currentText.replace(/\n/g, '<br>');
      updateProgressBar(((mainI + 1) / totalLength) * 100);
      mainI++;

      numbersTypingTimeout = setTimeout(() => {
        requestAnimationFrame(glitchType);
      }, 15);
    } else {
      textContainer.innerHTML = mainText.replace(/\n/g, '<br>');
      signContainer.innerHTML = signText;
      updateProgressBar(100);
      setTimeout(() => {
        if (typingProgressBar) {
          typingProgressBar.style.opacity = '0';
          setTimeout(removeProgressBar, 300);
        }
      }, 500);
      clearNumbersTyping();
    }
  }

  glitchType();
}

function setImageSrc(img, src) {
  if (!img || !src) return;
  img.removeAttribute('srcset');
  img.srcset = '';
  img.setAttribute('src', src);
  img.src = src;
}

// ============================================
// NUMBERS MODE FUNCTIONALITY
// ============================================
let numbersMode = false;
let originalNickname = '';

function initNumbersMode() {
  const nicknameEl = document.querySelector('.nickname');
  if (nicknameEl) {
    originalNickname = nicknameEl.textContent;
  }
}

let glitchInterval = null;
let nicknameChangeTimeout = null;

function clearAllTimers() {
  if (glitchInterval) {
    clearInterval(glitchInterval);
    glitchInterval = null;
  }
  if (nicknameChangeTimeout) {
    clearTimeout(nicknameChangeTimeout);
    nicknameChangeTimeout = null;
  }
}

function setupAvatarClick() {
  if (!avatar || !avatarImg) return;
  
  avatar.addEventListener('click', function (e) {
    e.stopPropagation();
    const cardEl = document.querySelector('.card');
    const nickname = document.querySelector('.nickname');
    const bannerPic = document.querySelector('.banner-pic');
    
    if (!cardEl || !nickname || !bannerPic) return;
    
    clearAllTimers();
    
    if (!numbersMode) {
    avatarImg.setAttribute('data-original-src', avatarImg.getAttribute('src') || avatarImg.src);
    bannerPic.setAttribute('data-original-src', bannerPic.getAttribute('src') || bannerPic.src);

    setImageSrc(avatarImg, 'Image/avatar309.jpg');
    setImageSrc(bannerPic, 'Image/bg309.jpg');
    if (background) background.classList.add('numbers');
    cardEl.classList.add('numbers-mode');
    
    // Change menu toggle color to black in 309 mode
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle) {
      menuToggle.classList.add('numbers-mode');
    }
    if (sidebar) {
      sidebar.classList.add('numbers-mode');
    }
    
    // Disable parallax in numbers mode
    parallaxEnabled = false;
    stopParallax();
    if (background) {
      background.style.transform = 'none';
    }

    const bubbleGroup = document.querySelector('.bubble-group');
    if (bubbleGroup) {
      const originalBubbles = bubbleGroup.innerHTML;
      bubbleGroup.setAttribute('data-original-bubbles', originalBubbles);
      bubbleGroup.innerHTML = `
        <div class="bubble">2022-2024</div>
        <div class="bubble-row">
          <div class="bubble">A. heosis</div>
          <div class="bubble">E. warlamov</div>
        </div>
      `;
    }

    let glitchText = originalNickname;
    
    glitchInterval = setInterval(() => {
      nickname.textContent = glitchText.split('').map(char => 
        Math.random() > 0.7 ? String.fromCharCode(Math.random() * 100 + 100) : char
      ).join('');
    }, 50);
    
    nicknameChangeTimeout = setTimeout(() => {
      if (glitchInterval) {
        clearInterval(glitchInterval);
        glitchInterval = null;
      }
      if (numbersMode) {
        nickname.textContent = "MEMORY OF 309";
      }
    }, 1000);

    numbersMode = true;
    pendingNumbersTyping = true;
    setTimeout(() => {
      if (!numbersMode || !pendingNumbersTyping) return;
      if (card && card.classList.contains('flipped')) {
        startNumbersBackTyping();
      }
    }, 200);
    
    // Update snowflake colors if snow is active
    if (snowActive) {
      updateSnowflakeColors();
    }
  } else {
    setImageSrc(avatarImg, avatarImg.getAttribute('data-original-src'));
    setImageSrc(bannerPic, bannerPic.getAttribute('data-original-src'));
    if (background) background.classList.remove('numbers');
    cardEl.classList.remove('numbers-mode');
    
    // Restore menu toggle color
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle) {
      menuToggle.classList.remove('numbers-mode');
    }
    if (sidebar) {
      sidebar.classList.remove('numbers-mode');
    }
    
    clearAllTimers();
    clearTimeout(typingTimeout);
    clearNumbersTyping();
    pendingNumbersTyping = false;
    removeProgressBar();
    removeNumbersGlitchText();
    nickname.textContent = originalNickname;
    
    // Re-enable parallax
    if (window.innerWidth > 768) {
      parallaxEnabled = true;
      initParallax();
    }

    const bubbleGroup = document.querySelector('.bubble-group');
    if (bubbleGroup) {
      const originalBubbles = bubbleGroup.getAttribute('data-original-bubbles');
      if (originalBubbles) {
        bubbleGroup.innerHTML = originalBubbles;
      }
    }

    setTimeout(() => {
      const cardBack = document.querySelector('.card-back');
      if (!cardBack) return;
      removeNumbersGlitchText();
      
      // Restore typing text display
      const existingTypingText = document.getElementById('typing-text');
      if (existingTypingText) {
        existingTypingText.style.display = 'block';
      }
    }, 400);
    numbersMode = false;
    
    // Update snowflake colors if snow is active
    if (snowActive) {
      updateSnowflakeColors();
    }
    }
  });
}

// ============================================
// ENHANCED HOVER EFFECTS
// ============================================
function setupHoverEffects() {
  const links = document.querySelectorAll('.links a');
  links.forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px)';
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================
function setupIntersectionObserver() {
  if (!card || !('IntersectionObserver' in window)) return;
  if (cardObserver) return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
  };
  
  cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  cardObserver.observe(card);
}

// ============================================
// ACCESSIBILITY IMPROVEMENTS
// ============================================
// Keyboard navigation
function setupKeyboardNavigation() {
  if (!card) return;
  
  card.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!e.target.closest('#avatar') && !e.target.closest('.avatar')) {
        card.classList.toggle('flipped');
        if (card.classList.contains('flipped')) {
          if (numbersMode) {
            startNumbersBackTyping();
          } else {
            setTimeout(startTyping, 700);
          }
        } else {
          const typingElement = document.getElementById('typing-text');
          if (typingElement) typingElement.textContent = '';
          clearTimeout(typingTimeout);
          clearNumbersTyping();
          pendingNumbersTyping = numbersMode;
          removeProgressBar();
          removeNumbersGlitchText();
        }
        card.setAttribute('aria-expanded', String(card.classList.contains('flipped')));
      }
    }
  });

  // Make card focusable for keyboard navigation
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-expanded', 'false');
}

// ============================================
// INITIALIZATION
// ============================================
// Add loaded class for animations
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  
  // Stagger animations
  const animatedElements = document.querySelectorAll('.banner-wrap, .profile-info, .nickname, .bubble-group, .location, .links');
  animatedElements.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.1}s`;
  });
});

function setupImageLoadState() {
  if (!avatarImg) return;

  if (avatarImg.complete) {
    avatarImg.style.opacity = '1';
    return;
  }

  avatarImg.addEventListener('load', () => {
    avatarImg.style.opacity = '1';
  }, { once: true });
}

// ============================================
// SNOW ANIMATION
// ============================================
let snowActive = false;
let snowContainer = null;
let snowInterval = null;
let sakuraActive = false;
let sakuraContainer = null;
let sakuraInterval = null;
let sakuraImageLoaded = false;
let sakuraImageChecked = false;

function createSnowflake(isDeep = false) {
  const snowflake = document.createElement('div');
  snowflake.className = isDeep ? 'snowflake snowflake-deep' : 'snowflake';
  
  // Create circular snowflake
  const size = isDeep ? (Math.random() * 4 + 3) : (Math.random() * 6 + 4);
  snowflake.style.width = size + 'px';
  snowflake.style.height = size + 'px';
  snowflake.style.borderRadius = '50%';
  
  // Set color based on mode
  const cardEl = document.querySelector('.card');
  const isNumbersMode = cardEl?.classList.contains('numbers-mode');
  if (isNumbersMode) {
    snowflake.style.background = 'rgba(255, 255, 255, 0.8)';
  } else {
    snowflake.style.background = 'rgba(0, 0, 0, 0.6)';
  }
  
  snowflake.style.left = Math.random() * 100 + '%';
  // Slower animation - 0.2-0.4x speed (multiply duration by 2.5-5)
  const baseDuration = (Math.random() * 3 + 2) * 3.5; // 3.5x slower on average
  snowflake.style.animationDuration = baseDuration + 's';
  return snowflake;
}

function startSnow() {
  if (snowActive || !document.body) return;
  
  snowActive = true;
  snowContainer = document.createElement('div');
  snowContainer.className = 'snow-container';
  document.body.appendChild(snowContainer);
  
  // Create initial snowflakes
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      if (snowContainer && snowActive) {
        const flake = createSnowflake(Math.random() > 0.6);
        snowContainer.appendChild(flake);
        // Remove after animation completes
        const duration = parseFloat(flake.style.animationDuration) * 1000 || 17500;
        setTimeout(() => {
          if (flake && flake.parentNode && snowActive) {
            flake.remove();
          }
        }, duration + 200);
      }
    }, i * 300);
  }
  
  // Add more snowflakes periodically
  snowInterval = setInterval(() => {
    if (snowContainer && snowActive) {
      // Front layer snowflakes (lighter, bigger)
      if (Math.random() > 0.3) {
        const flake = createSnowflake(false);
        if (snowContainer && snowActive) {
          snowContainer.appendChild(flake);
          // Remove after animation completes (snowflakes fall to bottom of screen)
          const duration = parseFloat(flake.style.animationDuration) * 1000 || 17500;
          setTimeout(() => {
            if (flake && flake.parentNode && snowActive) {
              flake.remove();
            }
          }, duration + 200);
        }
      }
      // Deep layer snowflakes (darker, smaller)
      if (Math.random() > 0.5) {
        const flake = createSnowflake(true);
        if (snowContainer && snowActive) {
          snowContainer.appendChild(flake);
          // Remove after animation completes
          const duration = parseFloat(flake.style.animationDuration) * 1000 || 21000;
          setTimeout(() => {
            if (flake && flake.parentNode && snowActive) {
              flake.remove();
            }
          }, duration + 200);
        }
      }
    }
  }, 500);
  
  // Update existing snowflakes color when mode changes
  updateSnowflakeColors();
}

function updateSnowflakeColors() {
  if (!snowContainer || !snowActive) return;
  
  const cardEl = document.querySelector('.card');
  const isNumbersMode = cardEl?.classList.contains('numbers-mode');
  const snowflakes = snowContainer.querySelectorAll('.snowflake');
  
  snowflakes.forEach(flake => {
    if (isNumbersMode) {
      flake.style.background = 'rgba(255, 255, 255, 0.8)';
    } else {
      flake.style.background = 'rgba(0, 0, 0, 0.6)';
    }
  });
}

function stopSnow() {
  snowActive = false;
  if (snowInterval) {
    clearInterval(snowInterval);
    snowInterval = null;
  }
  if (snowContainer) {
    snowContainer.remove();
    snowContainer = null;
  }
}

// ============================================
// SAKURA PETALS ANIMATION
// ============================================
function preloadSakuraImage() {
  if (sakuraImageChecked) return;
  sakuraImageChecked = true;

  const sakuraImg = new Image();
  sakuraImg.onload = () => {
    sakuraImageLoaded = true;
  };
  sakuraImg.onerror = () => {
    sakuraImageLoaded = false;
  };
  sakuraImg.src = 'Image/sakura.png';
}

function createSakuraPetal(isDeep = false) {
  if (!sakuraImageLoaded) return null;

  const petal = document.createElement('div');
  petal.className = isDeep ? 'sakura-petal sakura-petal-deep' : 'sakura-petal';

  const petalCore = document.createElement('span');
  petalCore.className = 'sakura-petal-core';

  const size = isDeep ? (Math.random() * 10 + 10) : (Math.random() * 12 + 14);
  const fallDuration = isDeep ? (Math.random() * 7 + 16) : (Math.random() * 6 + 12);
  const swayDuration = Math.random() * 2 + 2;
  const driftX = (Math.random() - 0.5) * (isDeep ? 180 : 260);
  const swayX = Math.random() * 16 + 8;
  const spinDeg = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 420 + 240);
  const opacity = isDeep ? (Math.random() * 0.2 + 0.25) : (Math.random() * 0.35 + 0.45);

  petal.style.left = `${Math.random() * 110 - 5}vw`;
  petal.style.setProperty('--petal-size', `${size}px`);
  petal.style.setProperty('--fall-duration', `${fallDuration}s`);
  petal.style.setProperty('--drift-x', `${driftX}px`);
  petal.style.setProperty('--spin-deg', `${spinDeg}deg`);
  petal.style.setProperty('--petal-opacity', `${opacity}`);
  petal.style.animationDelay = `${Math.random() * 1.2}s`;

  petalCore.style.setProperty('--sway-duration', `${swayDuration}s`);
  petalCore.style.setProperty('--sway-x', `${swayX}px`);

  petal.appendChild(petalCore);
  return petal;
}

function spawnSakuraPetal(isDeep = false) {
  if (!sakuraContainer) return;
  const petal = createSakuraPetal(isDeep);
  if (!petal) return;
  sakuraContainer.appendChild(petal);

  const duration = parseFloat(petal.style.getPropertyValue('--fall-duration')) * 1000 || 18000;
  setTimeout(() => {
    if (petal.parentNode) {
      petal.remove();
    }
  }, duration + 400);
}

function startSakura() {
  if (!document.body || sakuraContainer || sakuraActive) return;

  sakuraActive = true;
  preloadSakuraImage();
  sakuraContainer = document.createElement('div');
  sakuraContainer.className = 'sakura-container';
  document.body.appendChild(sakuraContainer);

  for (let i = 0; i < 22; i++) {
    setTimeout(() => {
      if (!sakuraContainer) return;
      spawnSakuraPetal(Math.random() > 0.65);
    }, i * 220);
  }

  sakuraInterval = setInterval(() => {
    if (!sakuraContainer) return;
    spawnSakuraPetal(false);
    if (Math.random() > 0.45) {
      spawnSakuraPetal(true);
    }
  }, 420);
}

function stopSakura() {
  if (!sakuraActive && !sakuraContainer) return;
  sakuraActive = false;
  if (sakuraInterval) {
    clearInterval(sakuraInterval);
    sakuraInterval = null;
  }
  if (sakuraContainer) {
    sakuraContainer.remove();
    sakuraContainer = null;
  }
}

window.addEventListener('beforeunload', () => {
  stopParallax();
  stopSnow();
  stopSakura();
});

function setupSnowToggle() {
  const snowToggle = document.getElementById('snowToggle');
  if (!snowToggle) return;
  
  snowToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    this.classList.toggle('active');
    const isActive = this.classList.contains('active');
    this.setAttribute('aria-pressed', String(isActive));
    
    if (isActive) {
      startSnow();
      if (snowContainer && snowContainer.children.length === 0) {
        const flake = createSnowflake(false);
        snowContainer.appendChild(flake);
      }
    } else {
      stopSnow();
    }
  });
}

function setupSakuraToggle() {
  const sakuraToggle = document.getElementById('sakuraToggle');
  if (!sakuraToggle) return;

  sakuraToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    this.classList.toggle('active');
    const isActive = this.classList.contains('active');
    this.setAttribute('aria-pressed', String(isActive));

    if (isActive) {
      startSakura();
      if (sakuraContainer && sakuraContainer.children.length === 0 && sakuraImageLoaded) {
        spawnSakuraPetal(false);
      }
    } else {
      stopSakura();
    }
  });
}

// ============================================
// SIDEBAR MENU FUNCTIONALITY
// ============================================
function setupSidebar() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  
  if (!menuToggle || !sidebar || !sidebarOverlay) return;
  
  function openSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    menuToggle.classList.add('moved');
    menuToggle.classList.add('spinning');
    menuToggle.setAttribute('aria-expanded', 'true');
    initialBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      menuToggle.classList.remove('spinning');
    }, 600);
  }
  
  function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    menuToggle.classList.remove('moved');
    menuToggle.classList.add('spinning');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = initialBodyOverflow;
    setTimeout(() => {
      menuToggle.classList.remove('spinning');
    }, 600);
  }
  
  menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    if (sidebar.classList.contains('active')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  menuToggle.setAttribute('aria-expanded', 'false');
  
  sidebarOverlay.addEventListener('click', closeSidebar);
  
  // Close sidebar when clicking outside
  document.addEventListener('click', function(e) {
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target)) {
      closeSidebar();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });
}

// ============================================
// LANGUAGE TOGGLE FUNCTIONALITY
// ============================================
let isEnglish = false;
const translations = {
  ru: {
    snow: 'Снег',
    sakura: 'Сакура',
    language: 'Язык',
    nickname: '@fuckgrazie',
    bubbles: ['гарант сделок', 'ceo of newermxre'],
    location: 'London',
    typingContent: 'Денис Валапов (A.K.A. fuckgrazie) — криптогарант и специалист по социальной инженерии и OSINT-расследованиям с опытом проведения расследований и анализа информации из открытых источников. Работаю системно и нацелен на результат.',
    reviews: 'ОТЗЫВЫ',
    tgk: 'ТГК'
  },
  en: {
    snow: 'Snow',
    sakura: 'Petals',
    language: 'Language',
    nickname: '@fuckgrazie',
    bubbles: ['deal guarantor', 'ceo of newermxre'],
    location: 'London',
    typingContent: 'Denis Valapov (A.K.A. fuckgrazie) is a crypto guarantor and specialist in social engineering and OSINT investigations with experience in conducting investigations and analyzing information from open sources. I work systematically and focus on results.',
    reviews: 'REVIEWS',
    tgk: 'TGK'
  }
};

function setupLanguageToggle() {
  const translateToggle = document.getElementById('translateToggle');
  if (!translateToggle) return;
  
  translateToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    isEnglish = !isEnglish;
    const lang = isEnglish ? 'en' : 'ru';
    const t = translations[lang];
    
    // Update labels
    const snowLabel = document.getElementById('snowLabel');
    const sakuraLabel = document.getElementById('sakuraLabel');
    const translateLabel = document.getElementById('translateLabel');
    if (snowLabel) snowLabel.textContent = t.snow;
    if (sakuraLabel) sakuraLabel.textContent = t.sakura;
    if (translateLabel) translateLabel.textContent = t.language;
    
    // Update bubbles
    const bubbles = document.querySelectorAll('.bubble-group .bubble');
    if (bubbles.length >= 2 && !document.querySelector('.card').classList.contains('numbers-mode')) {
      bubbles[0].textContent = t.bubbles[0];
      bubbles[1].textContent = t.bubbles[1];
    }
    
    // Update location
    const locationSpan = document.querySelector('.location span');
    if (locationSpan) locationSpan.textContent = t.location;
    
    // Update buttons
    const reviewBtn = document.querySelector('.back-btn span');
    if (reviewBtn) reviewBtn.textContent = t.reviews;
    const tgkBtns = document.querySelectorAll('.back-btn span');
    if (tgkBtns.length > 1) {
      tgkBtns[1].textContent = t.tgk;
    }

    // Update typing content if card is flipped
    if (document.querySelector('.card').classList.contains('flipped')) {
      const typingElement = document.getElementById('typing-text');
      if (typingElement && typingElement.textContent) {
        // Restart typing with new content
        clearTimeout(typingTimeout);
        removeProgressBar();
        setTimeout(() => {
          startTyping();
        }, 100);
      }
    }
  });
}






