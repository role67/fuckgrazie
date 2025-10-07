const card = document.getElementById('profileCard');
const typingText = document.getElementById('typing-text');
const typingContent =
  'Денис Валапоп A.K.A fuckgrazie -  Криптогарант и ведущий специалист в сфере социальной инженерии и OSINT-расследований.\nСпециализируюсь на взломе карточек артистов на платформе Spotify и Yandex music. Являюсь одним из самых востребованных экспертов в своей нише.';
let typingTimeout;

card.addEventListener('click', function (e) {
  if (e.target.closest('#avatar')) return;
  card.classList.toggle('flipped');

  if (card.classList.contains('flipped')) {
    setTimeout(startTyping, 700);
  } else {
    if (typingText) typingText.textContent = '';
    clearTimeout(typingTimeout);
  }
});
const cryptChars = '田水火空後前左右上下!@#$%^&*!@#$%^&*'.split('');

function getRandomChar() {
    return cryptChars[Math.floor(Math.random() * cryptChars.length)];
}

function startTyping() {
    if (!typingText) return;
    typingText.textContent = '';
    let i = 0;
    let finalText = '';
    let scrambleLength = 5;

    function scramble() {
        if (i < typingContent.length) {
            finalText = finalText + typingContent[i];
            let currentText = finalText;
            
            for(let j = 0; j < scrambleLength; j++) {
                currentText += getRandomChar();
            }
            
            typingText.textContent = currentText;
            i++;

            typingTimeout = setTimeout(() => {
                requestAnimationFrame(scramble);
            }, 30);
        } else {
            typingText.textContent = finalText;
        }
    }
    
    scramble();
}

const avatar = document.getElementById('avatar');
const avatarImg = document.getElementById('avatarImg');
const background = document.getElementById('background');
let numbersMode = false;

const originalAvatarSrc = avatarImg.src;
const originalNickname = document.querySelector('.nickname').textContent;

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

avatar.addEventListener('click', function (e) {
  e.stopPropagation();
  const card = document.querySelector('.card');
  const nickname = document.querySelector('.nickname');
  const bannerPic = document.querySelector('.banner-pic');
  
  clearAllTimers();
  
  if (!numbersMode) {
    avatarImg.setAttribute('data-original-src', avatarImg.src);
    bannerPic.setAttribute('data-original-src', bannerPic.src);

    avatarImg.src = 'Image/avatar309.jpg';
    bannerPic.src = 'Image/bg309.jpg';
    background.classList.add('numbers');
    card.classList.add('numbers-mode');

    const bubbleGroup = document.querySelector('.bubble-group');
    const originalBubbles = bubbleGroup.innerHTML;
    bubbleGroup.setAttribute('data-original-bubbles', originalBubbles);
    bubbleGroup.innerHTML = `
      <div class="bubble">2022-2024</div>
      <div class="bubble-row">
        <div class="bubble">A. heosis</div>
        <div class="bubble">E. warlamov</div>
      </div>
    `;

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

    setTimeout(() => {
      const cardBack = document.querySelector('.card-back');
      if (!cardBack) return;
      let oldGlitch = cardBack.querySelector('.numbers-glitch-text');
      if (oldGlitch) oldGlitch.remove();
      let mainText = `Мы помним всех, кто был с нами - тех, кто поддерживал в трудные моменты и не отвернулся, а помог, как мог. Спасибо вам за всё хорошее, за время, проведённое вместе. Даже если вы этого не прочтёте, мы искренне желаем вам всего наилучшего. Мы помним и тех, кто был против нас - и вам тоже желаем добра. Спасибо за всё.`;
      let signText = `309sq. 2022–2024`;
      
      let container = document.createElement('div');
      container.className = 'numbers-glitch-text';
      
      let textContainer = document.createElement('div');
      textContainer.className = 'main-text';
      container.appendChild(textContainer);
      
      let signContainer = document.createElement('div');
      signContainer.className = 'sign-text';
      container.appendChild(signContainer);
      cardBack.appendChild(container);
      let i = 0;
      let mainI = 0;
      function glitchType() {
        if (mainI <= mainText.length) {
          let finalText = mainText.slice(0, mainI);
          let currentText = finalText;

          let scrambleLength = 5 + Math.floor(Math.random() * 3);
          for(let j = 0; j < scrambleLength; j++) {
            currentText += String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
          }
            
          textContainer.innerHTML = currentText.replace(/\n/g, '<br>');
          mainI++;
            
          setTimeout(glitchType, 30);
        } else {
          textContainer.innerHTML = mainText.replace(/\n/g, '<br>');
          signContainer.innerHTML = signText;
        }
      }
      glitchType();
    }, 800);
    numbersMode = true;
  } else {
    avatarImg.src = avatarImg.getAttribute('data-original-src');
    bannerPic.src = bannerPic.getAttribute('data-original-src');
    background.classList.remove('numbers');
    card.classList.remove('numbers-mode');
    clearAllTimers();
    nickname.textContent = originalNickname;

    const bubbleGroup = document.querySelector('.bubble-group');
    bubbleGroup.innerHTML = bubbleGroup.getAttribute('data-original-bubbles');

    setTimeout(() => {
      const cardBack = document.querySelector('.card-back');
      if (!cardBack) return;
      let oldGlitch = cardBack.querySelector('.numbers-glitch-text');
      if (oldGlitch) oldGlitch.remove();
    }, 400);
    numbersMode = false;
  }
});