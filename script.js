// ============================================
// ETNA ESCAPE GAME - JavaScript Logic
// ============================================

// Global variables
let startTime = null;
let timerInterval = null;

// ============================================
// TIMER FUNCTIONALITY
// ============================================

function initTimer() {
  const timerElement = document.getElementById('timer');
  if (!timerElement) return;

  // Get or set start time in sessionStorage
  if (!sessionStorage.getItem('escapeGameStartTime')) {
    sessionStorage.setItem('escapeGameStartTime', Date.now().toString());
  }
  
  startTime = parseInt(sessionStorage.getItem('escapeGameStartTime'));
  
  // Update timer every second
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

// ============================================
// TYPEWRITER EFFECT
// ============================================

function typeWriter(element, text, speed = 30, callback = null) {
  let i = 0;
  
  // For boxes with HTML content, just fade them in
  if (element.classList.contains('warning-box') || 
      element.classList.contains('info-box') || 
      element.classList.contains('success-box') ||
      element.classList.contains('error-box')) {
    element.classList.add('typing');
    if (callback) callback();
    return;
  }
  
  // Normal typewriter for text elements
  element.innerHTML = '';
  element.classList.add('typing');
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  }
  
  type();
}

function typeWriterMultiple(elements, speed = 30) {
  let currentIndex = 0;
  
  function typeNext() {
    if (currentIndex < elements.length) {
      const element = elements[currentIndex];
      const text = element.getAttribute('data-text') || element.textContent;
      
      // Store text in data attribute if not already there
      if (!element.getAttribute('data-text')) {
        element.setAttribute('data-text', text);
      }
      
      typeWriter(element, text, speed, () => {
        currentIndex++;
        setTimeout(typeNext, 100); // Shorter delay between elements
      });
    } else {
      // All typewriter elements done - show delayed elements
      showDelayedElements();
    }
  }
  
  typeNext();
}

// Show elements that should appear after typewriter is done
function showDelayedElements() {
  const delayedElements = document.querySelectorAll('.delayed-text');
  let delay = 0;
  
  delayedElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('show');
    }, delay);
    delay += 300; // 300ms between each delayed element
  });
}

// Initialize typewriter on page load
document.addEventListener('DOMContentLoaded', () => {
  const typewriterElements = document.querySelectorAll('.typewriter');
  if (typewriterElements.length > 0) {
    // Special handling for index page
    if (document.body.querySelector('#system-logs')) {
      initIndexPage(Array.from(typewriterElements));
    } else {
      // Regular pages - slightly faster than index but readable
      typeWriterMultiple(Array.from(typewriterElements), 20);
    }
  }
});

// Special initialization for index page with glitch and logs
function initIndexPage(elements) {
  let currentIndex = 0;
  let loginValidated = false;
  
  function typeNext() {
    if (currentIndex < elements.length) {
      const element = elements[currentIndex];
      
      // Skip elements that don't have typewriter class
      if (!element.classList.contains('typewriter')) {
        currentIndex++;
        setTimeout(typeNext, 100);
        return;
      }
      
      const text = element.getAttribute('data-text') || element.textContent;
      
      if (!element.getAttribute('data-text')) {
        element.setAttribute('data-text', text);
      }
      
      // Check if this is the "pré-rentrée" text - show login after it
      if (element.textContent.includes('pré-rentrée')) {
        typeWriter(element, text, 30, () => {
          currentIndex++;
          // Show login section
          setTimeout(() => {
            showLoginSection(() => {
              // After successful login, continue with corrupted text
              loginValidated = true;
              setTimeout(typeNext, 500);
            });
          }, 400);
        });
      }
      // Check if this is the corrupted text (only show after login)
      else if (element.id === 'corrupted-text') {
        if (!loginValidated) {
          // Skip if login not validated yet
          setTimeout(typeNext, 100);
          return;
        }
        // Make it visible and type
        element.style.opacity = '1';
        typeWriter(element, text, 20, () => {
          currentIndex++;
          // After corrupted text, show system logs
          setTimeout(() => {
            showSystemLogs(() => {
              // After logs, continue with remaining typewriter elements
              setTimeout(typeNext, 800);
            });
          }, 500);
        });
      } else {
        typeWriter(element, text, 30, () => {
          currentIndex++;
          setTimeout(typeNext, 400);
        });
      }
    } else {
      // Show remaining delayed elements with fade-in after all animations
      setTimeout(() => {
        const delayedElements = document.querySelectorAll('.delayed-text');
        delayedElements.forEach((el, index) => {
          setTimeout(() => {
            el.style.opacity = '1';
          }, index * 600);
        });
        
        // Focus on command input after everything is shown
        setTimeout(() => {
          const commandInput = document.getElementById('commandInput');
          if (commandInput) {
            commandInput.focus();
          }
        }, delayedElements.length * 600);
      }, 500);
    }
  }
  
  typeNext();
}

// Show login section and handle validation
function showLoginSection(callback) {
  const loginSection = document.getElementById('login-section');
  const loginInput = document.getElementById('loginInput');
  const loginStatus = document.getElementById('login-status');
  
  if (!loginSection || !loginInput || !loginStatus) {
    if (callback) callback();
    return;
  }
  
  // Show login section
  loginSection.style.opacity = '1';
  loginSection.classList.add('show');
  
  // Focus on input
  setTimeout(() => {
    loginInput.focus();
  }, 300);
  
  // Handle login submission
  loginInput.addEventListener('keypress', async function handleLogin(e) {
    if (e.key === 'Enter') {
      const login = loginInput.value.trim().toLowerCase();
      
      if (!login) {
        loginStatus.innerHTML = '<span style="color: var(--accent-red);">⚠️ Veuillez entrer un login</span>';
        return;
      }
      
      // Show "connexion en cours..."
      loginStatus.innerHTML = '<span style="color: var(--accent-yellow);">⏳ Connexion en cours<span class="loading-dots">...</span></span>';
      loginInput.disabled = true;
      
      // Simulate connection delay
      setTimeout(async () => {
        // Check if login is valid
        const isValid = await validateLogin(login);
        
        if (isValid) {
          loginStatus.innerHTML = '<span style="color: var(--success);">✅ Connexion réussie ! Bienvenue.</span>';
          
          // Remove event listener
          loginInput.removeEventListener('keypress', handleLogin);
          
          // Keep login section visible but disabled
          loginInput.style.opacity = '0.6';
          loginInput.style.cursor = 'not-allowed';
          
          // Continue to next step after brief delay
          setTimeout(() => {
            if (callback) callback();
          }, 800);
        } else {
          loginStatus.innerHTML = '<span style="color: var(--accent-red);">❌ Login incorrect. Vérifiez votre identifiant.</span>';
          loginInput.disabled = false;
          loginInput.value = '';
          loginInput.focus();
        }
      }, 1500);
    }
  });
}

// Validate login against list
async function validateLogin(login) {
  try {
    // Try to load logins from JSON file
    const response = await fetch('logins.json');
    if (response.ok) {
      const data = await response.json();
      return data.logins.includes(login);
    }
  } catch (error) {
    console.log('Could not load logins.json, using default list');
  }
  
  // Fallback: hardcoded list of logins
  const defaultLogins = [
    'dupont_j', 'martin_a', 'bernard_m', 'thomas_l', 'robert_p',
    'petit_c', 'durand_s', 'leroy_n', 'moreau_e', 'simon_f'
  ];
  
  return defaultLogins.includes(login);
}

// Show system logs line by line
function showSystemLogs(callback) {
  const logsContainer = document.getElementById('system-logs');
  if (!logsContainer) {
    if (callback) callback();
    return;
  }
  
  const logs = [
    { type: 'error', text: '❌ Dossiers corrompus' },
    { type: 'error', text: '❌ Bases de données introuvable' },
    { type: 'error', text: '❌ Inscription bloquée' },
    { type: 'warning', text: '⚠️ Risque système critique' }
  ];
  
  let logIndex = 0;
  
  function showNextLog() {
    if (logIndex < logs.length) {
      const log = logs[logIndex];
      const logElement = document.createElement('div');
      logElement.className = `system-log ${log.type}`;
      logElement.textContent = log.text;
      logElement.style.animationDelay = `${logIndex * 0.1}s`;
      
      logsContainer.appendChild(logElement);
      logIndex++;
      
      setTimeout(showNextLog, 400);
    } else {
      if (callback) callback();
    }
  }
  
  showNextLog();
}

// ============================================
// COMMAND SYSTEM
// ============================================

function setupCommandSystem() {
  const commandInput = document.getElementById('commandInput');
  const commandOutput = document.getElementById('commandOutput');
  
  if (!commandInput) return;
  
  commandInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const command = commandInput.value.trim().toLowerCase();
      handleCommand(command, commandOutput);
      commandInput.value = '';
    }
  });
}

function handleCommand(command, outputElement) {
  const prompt = document.createElement('div');
  prompt.className = 'terminal-prompt';
  prompt.innerHTML = `<span class="terminal-prompt-symbol">></span> <span>${command}</span>`;
  
  if (outputElement) {
    outputElement.appendChild(prompt);
  }
  
  const output = document.createElement('div');
  output.className = 'terminal-output';
  
  switch(command) {
    case 'help':
    case 'aide':
      output.innerHTML = `
        <div class="info-box">
          <strong>Commandes disponibles :</strong><br>
          • next / suivant - Passer à l'étape suivante<br>
          • validate / valider - Valider votre réponse<br>
          • help / aide - Afficher cette aide<br>
          • clear / effacer - Effacer le terminal<br>
        </div>
      `;
      break;
    
    case 'clear':
    case 'effacer':
      if (outputElement) {
        outputElement.innerHTML = '';
      }
      return;
    
    case 'next':
    case 'suivant':
      // Check if we're on index page
      if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        window.location.href = 'etape1.html';
        return;
      }
      
      const nextButton = document.querySelector('a[href*="etape"] button, a[href*="final"] button');
      if (nextButton) {
        nextButton.closest('a').click();
      } else {
        output.innerHTML = '<div class="warning-box">⚠️ Veuillez d\'abord valider l\'énigme actuelle.</div>';
      }
      break;
    
    case 'validate':
    case 'valider':
      const validateButton = document.querySelector('button[id*="validate"]');
      if (validateButton) {
        validateButton.click();
      } else {
        output.innerHTML = '<div class="warning-box">⚠️ Aucune énigme à valider sur cette page.</div>';
      }
      break;
    
    default:
      output.innerHTML = `<div class="error-box">❌ Commande inconnue : "${command}". Tapez "help" pour voir les commandes disponibles.</div>`;
  }
  
  if (outputElement) {
    outputElement.appendChild(output);
    outputElement.scrollTop = outputElement.scrollHeight;
  }
}

// ============================================
// DRAG AND DROP (ETAPE 5)
// ============================================

function initDragAndDrop() {
  const blocks = document.querySelectorAll('.block');
  const dropzones = document.querySelectorAll('.dropzone');
  
  blocks.forEach(block => {
    block.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', block.getAttribute('data-id'));
      block.style.opacity = '0.5';
      block.classList.add('dragging');
    });
    
    block.addEventListener('dragend', (e) => {
      block.style.opacity = '1';
      block.classList.remove('dragging');
    });
  });
  
  dropzones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (zone.id !== 'source') {
        zone.classList.add('drag-over');
      }
    });
    
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });
    
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      
      // Don't allow dropping back to source
      if (zone.id === 'source') return;
      
      const dataId = e.dataTransfer.getData('text/plain');
      const draggedElement = document.querySelector(`[data-id="${dataId}"]`);
      
      if (!draggedElement) return;
      
      // Get all paths from the dragged element
      const paths = Array.from(draggedElement.querySelectorAll('.sous-texte')).map(el => el.textContent.trim());
      
      // Get the zone's path
      const zonePath = zone.getAttribute('data-path');
      
      // Check if this file belongs to this folder
      if (paths.includes(zonePath)) {
        // Clone the block for shared files or move it for single-destination files
        let targetBlock;
        
        if (paths.length > 1) {
          // File can go in multiple folders - clone it
          targetBlock = draggedElement.cloneNode(true);
          targetBlock.setAttribute('draggable', 'false'); // Already placed files can't be dragged
          targetBlock.classList.add('correct');
          targetBlock.style.cursor = 'default';
          
          // Mark the original as partially placed
          const originalId = draggedElement.getAttribute('data-id');
          markFileAsPlaced(originalId, zonePath);
        } else {
          // File has single destination - move it
          targetBlock = draggedElement;
          targetBlock.classList.add('correct');
          targetBlock.setAttribute('draggable', 'false');
          targetBlock.style.cursor = 'default';
        }
        
        const zoneContent = zone.querySelector('.zone-content');
        zoneContent.appendChild(targetBlock);
        
        // Check if this zone is complete
        checkZoneCompletion(zone);
        
        // Check global completion
        checkGlobalCompletion();
      } else {
        // Wrong folder - show feedback
        showDropFeedback(zone, false);
      }
    });
  });
}

// Track which files have been placed in which folders
const placedFiles = new Map();

function markFileAsPlaced(fileId, path) {
  if (!placedFiles.has(fileId)) {
    placedFiles.set(fileId, new Set());
  }
  placedFiles.get(fileId).add(path);
  
  // Check if this file is fully placed
  const originalBlock = document.querySelector(`#source [data-id="${fileId}"]`);
  if (originalBlock) {
    const allPaths = Array.from(originalBlock.querySelectorAll('.sous-texte')).map(el => el.textContent.trim());
    const placedPaths = placedFiles.get(fileId);
    
    // If all destinations are filled, remove from source
    if (allPaths.every(path => placedPaths.has(path))) {
      originalBlock.remove();
    }
  }
}

function checkZoneCompletion(zone) {
  const zonePath = zone.getAttribute('data-path');
  const expectedFiles = getExpectedFilesForZone(zonePath);
  const placedFiles = zone.querySelectorAll('.block.correct');
  
  if (placedFiles.length >= expectedFiles.length) {
    zone.classList.add('completed');
  }
}

function getExpectedFilesForZone(zonePath) {
  // Get all blocks from source that should go in this zone
  const allBlocks = document.querySelectorAll('.block[data-id]');
  const expected = [];
  
  allBlocks.forEach(block => {
    const paths = Array.from(block.querySelectorAll('.sous-texte')).map(el => el.textContent.trim());
    if (paths.includes(zonePath)) {
      expected.push(block.getAttribute('data-id'));
    }
  });
  
  return expected;
}

function checkGlobalCompletion() {
  // Check if all files have been placed correctly
  const sourceBlocks = document.querySelectorAll('#source .block');
  
  if (sourceBlocks.length === 0) {
    // All files have been sorted!
    showGlobalSuccess();
  }
}

function showGlobalSuccess() {
  const resultDiv = document.getElementById('result5');
  if (resultDiv && !resultDiv.innerHTML.includes('Tous les fichiers')) {
    resultDiv.innerHTML = `
      <div class="success-box" style="animation: slideIn 0.5s ease; margin-top: 20px;">
        <strong>✅ Excellent !</strong><br>
        Tous les fichiers sont maintenant correctement rangés !<br>
        Tapez "y" pour valider et obtenir votre lettre.
      </div>
    `;
  }
}

function showDropFeedback(zone, success) {
  const zonePath = zone.querySelector('.zone-path');
  if (!zonePath) return;
  
  const originalBg = zonePath.style.background;
  
  if (success) {
    zonePath.style.background = 'rgba(137, 209, 133, 0.3)';
  } else {
    zonePath.style.background = 'rgba(244, 135, 113, 0.3)';
  }
  
  setTimeout(() => {
    zonePath.style.background = originalBg;
  }, 500);
}

function showCommandFeedback(message, type = 'info') {
  const feedback = document.createElement('div');
  feedback.className = `terminal-output`;
  feedback.style.marginTop = '12px';
  feedback.style.padding = '12px';
  feedback.style.borderRadius = '4px';
  feedback.style.animation = 'slideIn 0.3s ease';
  
  if (type === 'success') {
    feedback.style.background = 'rgba(137, 209, 133, 0.1)';
    feedback.style.borderLeft = '3px solid var(--success)';
    feedback.style.color = 'var(--success)';
  } else if (type === 'error') {
    feedback.style.background = 'rgba(244, 135, 113, 0.1)';
    feedback.style.borderLeft = '3px solid var(--error)';
    feedback.style.color = 'var(--error)';
  } else if (type === 'warning') {
    feedback.style.background = 'rgba(220, 220, 170, 0.1)';
    feedback.style.borderLeft = '3px solid var(--accent-yellow)';
    feedback.style.color = 'var(--accent-yellow)';
  } else {
    feedback.style.background = 'rgba(78, 201, 176, 0.1)';
    feedback.style.borderLeft = '3px solid var(--accent-green)';
    feedback.style.color = 'var(--accent-green)';
  }
  
  feedback.textContent = message;
  
  const commandInput = document.querySelector('[id*="commandInput"]');
  if (commandInput && commandInput.parentElement) {
    commandInput.parentElement.parentElement.insertBefore(feedback, commandInput.parentElement);
  }
  
  setTimeout(() => {
    feedback.remove();
  }, 3000);
}

// Validation functions for steps 5-7 are now integrated
// in their respective command handlers (see INITIALIZATION section)

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize timer on all pages
  initTimer();
  
  // Setup command system if present
  setupCommandSystem();
  
  // Page-specific initializations
  const commandInputStep1 = document.getElementById('commandInputStep1');
  if (commandInputStep1) {
    let step1Validated = false;
    
    commandInputStep1.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const command = commandInputStep1.value.trim().toLowerCase();
        commandInputStep1.value = '';
        
        if (command === 'y' || command === 'validate' || command === 'valider') {
          validateStep1WithAnimation();
        } else if ((command === 'next' || command === 'suivant') && step1Validated) {
          window.location.href = 'etape2.html';
        } else if (command === 'next' || command === 'suivant') {
          showCommandFeedback('⚠️ Veuillez d\'abord valider vos réponses avec "y"', 'warning');
        } else if (command === 'help' || command === 'aide') {
          showCommandFeedback('Commandes : y (valider), next (étape suivante), help (aide)', 'info');
        } else {
          showCommandFeedback(`❌ Commande inconnue : "${command}"`, 'error');
        }
      }
    });
    
    function validateStep1WithAnimation() {
      const resultDiv = document.getElementById('result');
      
      // Show loading animation
      resultDiv.innerHTML = '<div class="terminal-output" style="color: var(--accent-yellow);">Vérification en cours<span class="loading-dots">...</span></div>';
      
      // Simulate checking delay
      setTimeout(() => {
        const answers = {
          'G11': 'labo',
          'G18': 'bureau pédagogique',
          'G12': 'service administratif',
          'Accueil': 'accueil',
          'G19': 'service technique',
          'Admissions': 'service admissions'
        };
        
        let allCorrect = true;
        let errors = [];
        
        for (const [room, expected] of Object.entries(answers)) {
          const input = document.getElementById(room);
          if (input) {
            const value = input.value.toLowerCase().trim();
            const isCorrect = value === expected || value === expected.replace('service ', '') || value === expected.replace('bureau ', '');
            
            if (!isCorrect) {
              allCorrect = false;
              errors.push(room);
              input.style.borderColor = 'var(--error)';
            } else {
              input.style.borderColor = 'var(--success)';
            }
          }
        }
        
        if (allCorrect) {
          resultDiv.innerHTML = `
            <div class="success-box" style="animation: slideIn 0.5s ease;">
              <strong>✅ Parfait !</strong><br>
              Tous les services sont correctement associés.<br><br>
              <div style="font-size: 20px; margin-top: 12px; padding: 12px; background: rgba(137, 209, 133, 0.2); border-radius: 4px;">
                Voici votre première lettre : <strong style="font-size: 32px; color: var(--accent-yellow);">V</strong>
              </div>
            </div>
          `;
          step1Validated = true;
          showCommandFeedback('✅ Tapez "next" pour continuer', 'success');
        } else {
          resultDiv.innerHTML = `
            <div class="error-box" style="animation: slideIn 0.5s ease;">
              <strong>❌ Erreur détectée</strong><br>
              Certaines salles ne correspondent pas aux bons services.<br>
              Salles incorrectes : <strong>${errors.join(', ')}</strong><br><br>
              Corrigez vos réponses et retapez "y" pour valider.
            </div>
          `;
        }
      }, 1500); // 1.5 second delay for loading animation
    }
  }
  const validateStep1Btn = document.getElementById('validate-step1');
  // Button validation removed - now using command input
  
  // STEP 2 - Command handler
  const commandInputStep2 = document.getElementById('commandInputStep2');
  if (commandInputStep2) {
    let step2Validated = false;
    
    commandInputStep2.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const command = commandInputStep2.value.trim().toLowerCase();
        commandInputStep2.value = '';
        
        if (command === 'y' || command === 'validate' || command === 'valider') {
          validateStep2WithAnimation();
        } else if ((command === 'next' || command === 'suivant') && step2Validated) {
          window.location.href = 'etape3.html';
        } else if (command === 'next' || command === 'suivant') {
          showCommandFeedback('⚠️ Veuillez d\'abord valider votre réponse avec "y"', 'warning');
        } else if (command === 'help' || command === 'aide') {
          showCommandFeedback('Commandes : y (valider), next (étape suivante)', 'info');
        } else {
          showCommandFeedback(`❌ Commande inconnue : "${command}"`, 'error');
        }
      }
    });
    
    function validateStep2WithAnimation() {
      const input = document.getElementById('etape2Input');
      const resultDiv = document.getElementById('result2');
      
      if (!input) return;
      
      resultDiv.innerHTML = '<div class="terminal-output" style="color: var(--accent-yellow);">Vérification en cours<span class="loading-dots">...</span></div>';
      
      setTimeout(() => {
        const answer = input.value.toLowerCase().trim();
        const correctAnswers = ['etna', 'l\'etna', 'letna'];
        
        if (correctAnswers.includes(answer)) {
          resultDiv.innerHTML = `
            <div class="success-box" style="animation: slideIn 0.5s ease;">
              <strong>✅ Bravo !</strong><br>
              Vous êtes bien à l'ETNA.<br><br>
              <div style="font-size: 20px; margin-top: 12px; padding: 12px; background: rgba(137, 209, 133, 0.2); border-radius: 4px;">
                Voici votre lettre : <strong style="font-size: 32px; color: var(--accent-yellow);">O</strong>
              </div>
            </div>
          `;
          step2Validated = true;
          showCommandFeedback('✅ Tapez "next" pour continuer', 'success');
        } else {
          resultDiv.innerHTML = `
            <div class="error-box" style="animation: slideIn 0.5s ease;">
              <strong>❌ Mauvaise réponse</strong><br>
              Retournez en G11 pour trouver le code !
            </div>
          `;
        }
      }, 1500);
    }
  }
  
  // STEP 3 - Command handler
  const commandInputStep3 = document.getElementById('commandInputStep3');
  if (commandInputStep3) {
    let step3Validated = false;
    
    commandInputStep3.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const command = commandInputStep3.value.trim().toLowerCase();
        commandInputStep3.value = '';
        
        if (command === 'y' || command === 'validate' || command === 'valider') {
          validateStep3WithAnimation();
        } else if ((command === 'next' || command === 'suivant') && step3Validated) {
          window.location.href = 'etape4.html';
        } else if (command === 'next' || command === 'suivant') {
          showCommandFeedback('⚠️ Veuillez d\'abord valider vos décodages avec "y"', 'warning');
        } else if (command === 'help' || command === 'aide') {
          showCommandFeedback('Commandes : y (valider), next (étape suivante)', 'info');
        } else {
          showCommandFeedback(`❌ Commande inconnue : "${command}"`, 'error');
        }
      }
    });
    
    function validateStep3WithAnimation() {
      const bin1 = document.getElementById('bin1');
      const bin2 = document.getElementById('bin2');
      const bin3 = document.getElementById('bin3');
      const resultDiv = document.getElementById('result3');
      
      if (!bin1 || !bin2 || !bin3) return;
      
      resultDiv.innerHTML = '<div class="terminal-output" style="color: var(--accent-yellow);">Analyse du décodage<span class="loading-dots">...</span></div>';
      
      setTimeout(() => {
        const answers = {
          bin1: bin1.value.toLowerCase().trim(),
          bin2: bin2.value.toLowerCase().trim(),
          bin3: bin3.value.toLowerCase().trim()
        };
        
        const hasEtna2Info = answers.bin1.includes('24 mois') || answers.bin1.includes('niveau 7');
        const hasEtna3Info = answers.bin2.includes('15 mois') || answers.bin2.includes('niveau 5');
        const hasEtna4Info = answers.bin3.includes('15 mois') || answers.bin3.includes('niveau 6') || answers.bin3.includes('informatique');
        
        if (hasEtna2Info && hasEtna3Info && hasEtna4Info) {
          resultDiv.innerHTML = `
            <div class="success-box" style="animation: slideIn 0.5s ease;">
              <strong>✅ Excellent travail !</strong><br>
              Vous avez décodé les formations.<br><br>
              <div style="font-size: 20px; margin-top: 12px; padding: 12px; background: rgba(137, 209, 133, 0.2); border-radius: 4px;">
                Voici votre lettre : <strong style="font-size: 32px; color: var(--accent-yellow);">L</strong>
              </div>
            </div>
          `;
          step3Validated = true;
          showCommandFeedback('✅ Tapez "next" pour continuer', 'success');
        } else {
          resultDiv.innerHTML = `
            <div class="error-box" style="animation: slideIn 0.5s ease;">
              <strong>❌ Attention</strong><br>
              Vérifiez que vous avez bien décodé tout le texte binaire pour chaque formation.
            </div>
          `;
        }
      }, 1500);
    }
  }
  
  // STEP 4 - Command handler
  const commandInputStep4 = document.getElementById('commandInputStep4');
  if (commandInputStep4) {
    let step4Validated = false;
    
    commandInputStep4.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const command = commandInputStep4.value.trim().toLowerCase();
        commandInputStep4.value = '';
        
        if (command === 'y' || command === 'validate' || command === 'valider') {
          validateStep4WithAnimation();
        } else if ((command === 'next' || command === 'suivant') && step4Validated) {
          window.location.href = 'etape5.html';
        } else if (command === 'next' || command === 'suivant') {
          showCommandFeedback('⚠️ Veuillez d\'abord valider votre correction avec "y"', 'warning');
        } else if (command === 'help' || command === 'aide') {
          showCommandFeedback('Commandes : y (valider), next (étape suivante)', 'info');
        } else {
          showCommandFeedback(`❌ Commande inconnue : "${command}"`, 'error');
        }
      }
    });
    
    function validateStep4WithAnimation() {
      const textarea = document.getElementById('codeHtml');
      const resultDiv = document.getElementById('result4');
      
      if (!textarea) return;
      
      resultDiv.innerHTML = '<div class="terminal-output" style="color: var(--accent-yellow);">Analyse du code<span class="loading-dots">...</span></div>';
      
      setTimeout(() => {
        const code = textarea.value.toLowerCase();
        const hasButton = code.includes('<button') && !code.includes('display:none') && !code.includes('display: none');
        
        if (hasButton) {
          resultDiv.innerHTML = `
            <div class="success-box" style="animation: slideIn 0.5s ease;">
              <strong>✅ Bien joué !</strong><br>
              Le bouton est maintenant visible.<br><br>
              <div style="font-size: 20px; margin-top: 12px; padding: 12px; background: rgba(137, 209, 133, 0.2); border-radius: 4px;">
                Voici votre lettre : <strong style="font-size: 32px; color: var(--accent-yellow);">C</strong>
              </div>
            </div>
          `;
          step4Validated = true;
          showCommandFeedback('✅ Tapez "next" pour continuer', 'success');
        } else {
          resultDiv.innerHTML = `
            <div class="error-box" style="animation: slideIn 0.5s ease;">
              <strong>❌ Pas encore</strong><br>
              Le bouton doit être visible (supprimez le display:none)
            </div>
          `;
        }
      }, 1500);
    }
    
    // Update iframe preview in real-time
    const textarea = document.getElementById('codeHtml');
    const iframe = document.getElementById('preview');
    
    if (textarea && iframe) {
      function updateIframe() {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(textarea.value);
        doc.close();
      }
      
      textarea.addEventListener('input', updateIframe);
      updateIframe();
    }
  }
  
  // STEP 5 - Command handler
  const commandInputStep5 = document.getElementById('commandInputStep5');
  if (commandInputStep5) {
    let step5Validated = false;
    
    commandInputStep5.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const command = commandInputStep5.value.trim().toLowerCase();
        commandInputStep5.value = '';
        
        if (command === 'y' || command === 'validate' || command === 'valider') {
          validateStep5WithAnimation();
        } else if ((command === 'next' || command === 'suivant') && step5Validated) {
          window.location.href = 'etape6.html';
        } else if (command === 'next' || command === 'suivant') {
          showCommandFeedback('⚠️ Veuillez d\'abord valider l\'organisation avec "y"', 'warning');
        } else if (command === 'help' || command === 'aide') {
          showCommandFeedback('Commandes : y (valider), next (étape suivante)', 'info');
        } else {
          showCommandFeedback(`❌ Commande inconnue : "${command}"`, 'error');
        }
      }
    });
    
    function validateStep5WithAnimation() {
      const zonePiscine = document.getElementById('zonePiscine');
      const zoneC2WK = document.getElementById('zoneC2WK');
      const zoneAlternance = document.getElementById('zoneAlternance');
      const sourceZone = document.getElementById('source');
      const resultDiv = document.getElementById('result5');
      
      resultDiv.innerHTML = '<div class="terminal-output" style="color: var(--accent-yellow);">Vérification de l\'organisation<span class="loading-dots">...</span></div>';
      
      setTimeout(() => {
        // Check if source is empty (all files have been placed)
        const remainingFiles = sourceZone.querySelectorAll('.block');
        
        if (remainingFiles.length === 0) {
          // All files are placed - victory!
          resultDiv.innerHTML = `
            <div class="success-box" style="animation: slideIn 0.5s ease;">
              <strong>✅ Parfait !</strong><br>
              Tous les fichiers sont correctement rangés dans leurs dossiers.<br><br>
              <div style="font-size: 20px; margin-top: 12px; padding: 12px; background: rgba(137, 209, 133, 0.2); border-radius: 4px;">
                Voici votre lettre : <strong style="font-size: 32px; color: var(--accent-yellow);">A</strong>
              </div>
            </div>
          `;
          step5Validated = true;
          showCommandFeedback('✅ Tapez "next" pour continuer', 'success');
        } else {
          // Some files are still in source - not complete
          const remainingCount = remainingFiles.length;
          resultDiv.innerHTML = `
            <div class="error-box" style="animation: slideIn 0.5s ease;">
              <strong>❌ Pas encore terminé</strong><br>
              Il reste encore ${remainingCount} fichier(s) à ranger.<br>
              Vérifiez les chemins de destination sur chaque fichier.
            </div>
          `;
        }
      }, 1500);
    }
    
    initDragAndDrop();
  }
  
  // STEP 6 - Command handler
  const commandInputStep6 = document.getElementById('commandInputStep6');
  if (commandInputStep6) {
    let step6Validated = false;
    
    commandInputStep6.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const command = commandInputStep6.value.trim().toLowerCase();
        commandInputStep6.value = '';
        
        if (command === 'y' || command === 'validate' || command === 'valider') {
          validateStep6WithAnimation();
        } else if ((command === 'next' || command === 'suivant') && step6Validated) {
          window.location.href = 'etape7.html';
        } else if (command === 'next' || command === 'suivant') {
          showCommandFeedback('⚠️ Veuillez d\'abord valider l\'identité avec "y"', 'warning');
        } else if (command === 'help' || command === 'aide') {
          showCommandFeedback('Commandes : y (valider), next (étape suivante)', 'info');
        } else {
          showCommandFeedback(`❌ Commande inconnue : "${command}"`, 'error');
        }
      }
    });
    
    function validateStep6WithAnimation() {
      const input = document.getElementById('hack');
      const resultDiv = document.getElementById('result6');
      
      if (!input) return;
      
      resultDiv.innerHTML = '<div class="terminal-output" style="color: var(--accent-yellow);">Analyse des traces<span class="loading-dots">...</span></div>';
      
      setTimeout(() => {
        const answer = input.value.toLowerCase().trim();
        const correctAnswers = ['yagan perrot', 'yagan', 'perrot'];
        
        if (correctAnswers.some(correct => answer.includes(correct))) {
          resultDiv.innerHTML = `
            <div class="success-box" style="animation: slideIn 0.5s ease;">
              <strong>✅ C'est lui !</strong><br>
              Vous avez trouvé le coupable.<br><br>
              <div style="font-size: 20px; margin-top: 12px; padding: 12px; background: rgba(137, 209, 133, 0.2); border-radius: 4px;">
                Voici votre lettre : <strong style="font-size: 32px; color: var(--accent-yellow);">N</strong>
              </div>
            </div>
          `;
          step6Validated = true;
          showCommandFeedback('✅ Tapez "next" pour continuer', 'success');
        } else {
          resultDiv.innerHTML = `
            <div class="error-box" style="animation: slideIn 0.5s ease;">
              <strong>❌ Mauvaise personne</strong><br>
              Relisez l'indice : c'est votre coordinateur pédagogique préféré !
            </div>
          `;
        }
      }, 1500);
    }
  }
  
  // STEP 7 - Command handler
  const commandInputStep7 = document.getElementById('commandInputStep7');
  if (commandInputStep7) {
    commandInputStep7.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const command = commandInputStep7.value.trim().toLowerCase();
        commandInputStep7.value = '';
        
        if (command === 'y' || command === 'validate' || command === 'valider') {
          validateStep7WithAnimation();
        } else if (command === 'help' || command === 'aide') {
          showCommandFeedback('Commandes : y (désactiver le malware)', 'info');
        } else {
          showCommandFeedback(`❌ Commande inconnue : "${command}"`, 'error');
        }
      }
    });
    
    function validateStep7WithAnimation() {
      const input = document.getElementById('finalCode');
      const resultDiv = document.getElementById('result7');
      
      if (!input) return;
      
      resultDiv.innerHTML = '<div class="terminal-output" style="color: var(--accent-red);">Tentative de désactivation<span class="loading-dots">...</span></div>';
      
      setTimeout(() => {
        const answer = input.value.toLowerCase().trim();
        const correctAnswers = ['volcan', 'v-o-l-c-a-n', 'volcano'];
        
        if (correctAnswers.includes(answer)) {
          resultDiv.innerHTML = `
            <div class="success-box" style="animation: slideIn 0.5s ease;">
              <strong>🎉 FÉLICITATIONS !</strong><br>
              Vous avez désactivé le malware !<br>
              Les lettres V-O-L-C-A-N formaient bien le mot de passe.<br><br>
              Redirection vers la page finale...
            </div>
          `;
          
          setTimeout(() => {
            window.location.href = 'final.html';
          }, 3000);
        } else {
          resultDiv.innerHTML = `
            <div class="error-box" style="animation: slideIn 0.5s ease;">
              <strong>❌ Mauvais mot de passe</strong><br>
              Utilisez les lettres récoltées : V-O-L-C-A-N
            </div>
          `;
        }
      }, 2000);
    }
  }
  
  const validateStep2Btn = document.getElementById('validate-step2');
  // Button validation removed - now using command input
  
  const validateStep3Btn = document.getElementById('validate-step3');
  // Button validation removed - now using command input
  
  const validateStep4Btn = document.getElementById('validate-step4');
  // Button validation removed - now using command input
  
  const validateStep5Btn = document.getElementById('validate-step5');
  // Button validation removed - now using command input
  
  const validateStep6Btn = document.getElementById('validate-step6');
  // Button validation removed - now using command input
  
  const validateStep7Btn = document.getElementById('validate-step7');
  // Button validation removed - now using command input
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to validate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const validateBtn = document.querySelector('button[id*="validate"]');
      if (validateBtn) validateBtn.click();
    }
  });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
