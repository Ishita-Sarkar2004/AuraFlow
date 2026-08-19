// ==========================================
// 🌌 AuraFlow — Complete Unified Application Script
// ==========================================

// --- STATE MANAGEMENT ---
let userDatabase = JSON.parse(localStorage.getItem('auraFlowUserDatabase')) || {};
let activeUserEmail = localStorage.getItem('auraFlowActiveEmail') || null;

let currentUser = null;
let appData = {
  todos: [],
  habits: [],
  events: [],
  finances: [],
  investments: [],
  journals: [],
  routines: [],
  workouts: [],
  bodyMetrics: {},
  waterCount: 0,
  calories: 0,
  theme: 'theme-default'
};

// Load Active User Profile & Logs from Database
function loadActiveUserData() {
  if (activeUserEmail && userDatabase[activeUserEmail]) {
    currentUser = userDatabase[activeUserEmail].profile;
    appData = userDatabase[activeUserEmail].sanctuaryData || appData;
  }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  loadActiveUserData();
  checkAuth();
  initTabNavigation();
  initCharts();
  applyStoredTheme();
  renderAllData();
  initSidebarDrawer();
  initAuthFormHandlers();
});

// 1. AUTHENTICATION & PORTAL MANAGEMENT
function checkAuth() {
  const portal = document.getElementById('auth-portal');
  if (!currentUser) {
    if (portal) portal.classList.remove('hidden');
  } else {
    if (portal) portal.classList.add('hidden');
    updateUserBadge();
    applyGenderContext();
    updateBrandTitle();
  }
}

function switchAuthMode(mode) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');

  if (mode === 'login') {
    if (tabLogin) tabLogin.classList.add('active');
    if (tabSignup) tabSignup.classList.remove('active');
    if (loginForm) loginForm.classList.remove('hidden');
    if (signupForm) signupForm.classList.add('hidden');
  } else {
    if (tabSignup) tabSignup.classList.add('active');
    if (tabLogin) tabLogin.classList.remove('active');
    if (signupForm) signupForm.classList.remove('hidden');
    if (loginForm) loginForm.classList.add('hidden');
  }
}

function initAuthFormHandlers() {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');

  // SIGNUP FORM HANDLER
  if (signupForm) {
    signupForm.onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value.trim().toLowerCase();
      const genderChoice = document.getElementById('signup-gender').value;

      if (userDatabase[email]) {
        alert("Account already exists! Please log in instead.");
        switchAuthMode('login');
        return;
      }

      // Assign initial theme by gender choice
      const assignedTheme = (genderChoice === 'male') ? 'theme-masculine' : 'theme-default';

      currentUser = {
        name: document.getElementById('signup-name').value,
        email: email,
        age: document.getElementById('signup-age').value,
        gender: genderChoice,
        photo: null,
        isPro: false
      };

      appData.theme = assignedTheme;
      activeUserEmail = email;

      userDatabase[activeUserEmail] = {
        profile: currentUser,
        sanctuaryData: appData
      };

      saveAllData();
      checkAuth();
      renderAllData();
    };
  }

  // LOGIN FORM HANDLER
  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim().toLowerCase();

      if (!userDatabase[email]) {
        alert("No profile found with this email. Please sign up first!");
        switchAuthMode('signup');
        return;
      }

      activeUserEmail = email;
      currentUser = userDatabase[activeUserEmail].profile;
      appData = userDatabase[activeUserEmail].sanctuaryData || appData;

      // Sync theme automatically if gender context requires it
      if (currentUser && currentUser.gender === 'male') {
        if (!appData.theme || appData.theme === 'theme-default') {
          appData.theme = 'theme-masculine';
        }
      }

      saveAllData();
      checkAuth();
      renderAllData();
    };
  }
}

function handleLogout() {
  saveAllData();
  activeUserEmail = null;
  currentUser = null;
  localStorage.removeItem('auraFlowActiveEmail');
  document.body.className = 'theme-default';
  checkAuth();
}

// 2. SIDEBAR DRAWER TOGGLE
function initSidebarDrawer() {
  const drawerBtn = document.getElementById('toggle-drawer-btn');
  const sidebar = document.getElementById('app-sidebar');
  if (drawerBtn && sidebar) {
    drawerBtn.onclick = (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('collapsed');
    };
  }
}

// 3. PROFILE EDIT & COMPRESSED AVATAR UPLOAD
function openProfileModal() {
  if (!currentUser) return;
  document.getElementById('edit-name').value = currentUser.name || '';
  document.getElementById('edit-age').value = currentUser.age || '';
  document.getElementById('edit-gender').value = currentUser.gender || 'female';
  document.getElementById('profile-modal').classList.remove('hidden');
}

function closeProfileModal() {
  document.getElementById('profile-modal').classList.add('hidden');
}

const editForm = document.getElementById('edit-profile-form');
if (editForm) {
  editForm.onsubmit = function(e) {
    e.preventDefault();
    const oldGender = currentUser.gender;
    currentUser.name = document.getElementById('edit-name').value;
    currentUser.age = document.getElementById('edit-age').value;
    currentUser.gender = document.getElementById('edit-gender').value;

    // Adapt theme if gender changed
    if (oldGender !== currentUser.gender) {
      appData.theme = (currentUser.gender === 'male') ? 'theme-masculine' : 'theme-default';
    }

    const photoInput = document.getElementById('edit-photo-file');
    if (photoInput && photoInput.files && photoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 150;
          canvas.height = 150;
          ctx.drawImage(img, 0, 0, 150, 150);
          
          currentUser.photo = canvas.toDataURL('image/jpeg', 0.8);
          saveAllData();
          updateUserBadge();
          applyGenderContext();
          closeProfileModal();
          showToast('Profile photo saved permanently! 📸✨');
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(photoInput.files[0]);
    } else {
      saveAllData();
      updateUserBadge();
      applyGenderContext();
      closeProfileModal();
      showToast('Profile details updated! ✨');
    }
  };
}

function updateUserBadge() {
  if (currentUser) {
    const nameEl = document.getElementById('display-user-name');
    const metaEl = document.getElementById('display-user-meta');
    const emailEl = document.getElementById('settings-email-display');

    if (nameEl) nameEl.textContent = currentUser.name;
    if (metaEl) metaEl.textContent = `${currentUser.age} yrs • ${currentUser.gender}`;
    if (emailEl) emailEl.textContent = currentUser.email || 'User';

    const avatarImg = document.getElementById('user-avatar-img');
    const avatarEmoji = document.getElementById('user-avatar-emoji');

    if (currentUser.photo) {
      if (avatarImg) {
        avatarImg.src = currentUser.photo;
        avatarImg.classList.remove('hidden');
      }
      if (avatarEmoji) avatarEmoji.classList.add('hidden');
    } else {
      if (avatarImg) avatarImg.classList.add('hidden');
      if (avatarEmoji) avatarEmoji.classList.remove('hidden');
    }
  }
}

function updateBrandTitle() {
  if (currentUser && currentUser.isPro) {
    const tag = document.getElementById('pro-tag');
    if (tag) tag.classList.remove('hidden');
  }
}

// DYNAMIC GENDER & THEME PALETTE ADAPTATION
function applyGenderContext() {
  if (!currentUser) return;
  const isMale = currentUser.gender === 'male';

  const femaleCard = document.getElementById('female-routine-card');
  const femaleBustGroup = document.getElementById('female-bust-group');
  const maleChestGroup = document.getElementById('male-chest-group');
  const routineCatSelect = document.getElementById('routine-category');

  if (isMale) {
    // Force slate blue theme for male profiles unless user specifically chose dark/mint/sunset
    if (!appData.theme || appData.theme === 'theme-default') {
      appData.theme = 'theme-masculine';
    }
    document.body.className = appData.theme;

    if (femaleCard) femaleCard.classList.add('hidden');
    if (femaleBustGroup) femaleBustGroup.classList.add('hidden');
    if (maleChestGroup) maleChestGroup.classList.remove('hidden');

    const navBtn = document.getElementById('nav-wellness-btn');
    if (navBtn) {
      const textEl = navBtn.querySelector('.nav-text');
      const iconEl = navBtn.querySelector('.nav-icon');
      if (textEl) textEl.textContent = 'Athletic & Wellness';
      if (iconEl) iconEl.textContent = '🏋️‍♂️';
    }

    const wellTitle = document.getElementById('well-title');
    const fitnessTitle = document.getElementById('fitness-card-title');
    const avatarEmoji = document.getElementById('user-avatar-emoji');

    if (wellTitle) wellTitle.textContent = '🏋️‍♂️ Athletic & Fitness Suite ⚡';
    if (fitnessTitle) fitnessTitle.textContent = '💪 Athletic Fitness, Fasting & Calories';
    if (!currentUser.photo && avatarEmoji) avatarEmoji.textContent = '⚡';

    if (routineCatSelect) {
      routineCatSelect.innerHTML = `
        <option value="Grooming">Grooming & Beard 🧔</option>
        <option value="Skincare">Skincare 🧴</option>
        <option value="Body Care">Body Care 🌸</option>
        <option value="Hair Care">Hair Care 💆‍♂️</option>
      `;
    }
  } else {
    // Set pastel pink theme for female profiles unless customized
    if (!appData.theme || appData.theme === 'theme-masculine') {
      appData.theme = 'theme-default';
    }
    document.body.className = appData.theme;

    if (femaleCard) femaleCard.classList.remove('hidden');
    if (femaleBustGroup) femaleBustGroup.classList.remove('hidden');
    if (maleChestGroup) maleChestGroup.classList.add('hidden');

    const navBtn = document.getElementById('nav-wellness-btn');
    if (navBtn) {
      const textEl = navBtn.querySelector('.nav-text');
      const iconEl = navBtn.querySelector('.nav-icon');
      if (textEl) textEl.textContent = 'Wellness & Lifestyle';
      if (iconEl) iconEl.textContent = '🌸';
    }

    const wellTitle = document.getElementById('well-title');
    const fitnessTitle = document.getElementById('fitness-card-title');
    const avatarEmoji = document.getElementById('user-avatar-emoji');

    if (wellTitle) wellTitle.textContent = '🌸 Wellness & Lifestyle Suite ✨';
    if (fitnessTitle) fitnessTitle.textContent = '🏃 Fitness, Fasting & Calories';
    if (!currentUser.photo && avatarEmoji) avatarEmoji.textContent = '✨';

    if (routineCatSelect) {
      routineCatSelect.innerHTML = `
        <option value="Skincare">Skincare 🧴</option>
        <option value="Body Care">Body Care 🌸</option>
        <option value="Hair Care">Hair Care 💆‍♀️</option>
      `;
    }
  }
}

// 4. SETTINGS & LOGOUT
function setTheme(themeName) {
  document.body.className = themeName;
  appData.theme = themeName;
  saveAllData();
  showToast(`Theme updated! ✨`);
}

function applyStoredTheme() {
  if (appData && appData.theme) {
    document.body.className = appData.theme;
  }
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) logoutBtn.onclick = handleLogout;

const resetBtn = document.getElementById('reset-data-btn');
if (resetBtn) {
  resetBtn.onclick = () => {
    if (confirm('Are you sure you want to reset all sanctuary data for this account?')) {
      if (activeUserEmail && userDatabase[activeUserEmail]) {
        delete userDatabase[activeUserEmail];
        localStorage.setItem('auraFlowUserDatabase', JSON.stringify(userDatabase));
      }
      localStorage.removeItem('auraFlowActiveEmail');
      location.reload();
    }
  };
}

// 5. TAB NAVIGATION
function initTabNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabViews = document.querySelectorAll('.tab-view');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) target.classList.add('active');
    });
  });

  const upgradeBtn = document.getElementById('upgrade-pro-btn');
  const closeProBtn = document.getElementById('close-pro-btn');

  if (upgradeBtn) {
    upgradeBtn.onclick = () => {
      const modal = document.getElementById('pro-modal');
      if (modal) modal.classList.remove('hidden');
    };
  }
  if (closeProBtn) {
    closeProBtn.onclick = () => {
      const modal = document.getElementById('pro-modal');
      if (modal) modal.classList.add('hidden');
    };
  }
}

// 6. TASKS & HABITS
const addTodoBtn = document.getElementById('add-todo-btn');
if (addTodoBtn) {
  addTodoBtn.onclick = () => {
    const input = document.getElementById('todo-input');
    if (!input || !input.value.trim()) return;
    appData.todos.push({ id: Date.now(), text: input.value.trim() });
    input.value = '';
    saveAllData();
    renderTodos();
    showToast('Goal added! ✨');
  };
}

function renderTodos() {
  const list = document.getElementById('todo-list');
  if (!list) return;
  list.innerHTML = '';
  (appData.todos || []).forEach(todo => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${todo.text}</span> <button onclick="deleteTodo(${todo.id})">🗑️</button>`;
    list.appendChild(li);
  });
}

function deleteTodo(id) {
  appData.todos = appData.todos.filter(t => t.id !== id);
  saveAllData();
  renderTodos();
}

const addHabitBtn = document.getElementById('add-habit-btn');
if (addHabitBtn) {
  addHabitBtn.onclick = () => {
    const input = document.getElementById('habit-input');
    if (!input || !input.value.trim()) return;
    appData.habits.push({ id: Date.now(), text: input.value.trim(), streak: 0 });
    input.value = '';
    saveAllData();
    renderHabits();
    showToast('Habit ritual created! ✨');
  };
}

function renderHabits() {
  const list = document.getElementById('habit-list');
  if (!list) return;
  list.innerHTML = '';
  (appData.habits || []).forEach(habit => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${habit.text} (🔥 ${habit.streak} Days)</span> <button onclick="incrementStreak(${habit.id})">+1 Streak ✨</button>`;
    list.appendChild(li);
  });
}

function incrementStreak(id) {
  const habit = appData.habits.find(h => h.id === id);
  if (habit) habit.streak += 1;
  saveAllData();
  renderHabits();
}

const addEventBtn = document.getElementById('add-event-btn');
if (addEventBtn) {
  addEventBtn.onclick = () => {
    const date = document.getElementById('event-date').value;
    const desc = document.getElementById('event-desc').value;
    if (!date || !desc) return;
    appData.events.push({ id: Date.now(), date, desc });
    saveAllData();
    renderEvents();
    showToast('Event scheduled! ✨');
  };
}

function renderEvents() {
  const list = document.getElementById('event-list');
  if (!list) return;
  list.innerHTML = '';
  (appData.events || []).forEach(ev => {
    const li = document.createElement('li');
    li.innerHTML = `<span>📅 <b>${ev.date}:</b> ${ev.desc}</span>`;
    list.appendChild(li);
  });
}

// 7. FINANCE
let finChart;
function initCharts() {
  const chartEl = document.getElementById('financeChart');
  if (!chartEl) return;
  const ctx = chartEl.getContext('2d');
  finChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: ['Income', 'Expenses'], datasets: [{ data: [0, 0], backgroundColor: ['#00B894', '#FF7675'] }] }
  });
  initWellnessCharts();
}

const addFinBtn = document.getElementById('add-fin-btn');
if (addFinBtn) {
  addFinBtn.onclick = () => {
    const desc = document.getElementById('fin-desc').value;
    const amount = parseFloat(document.getElementById('fin-amount').value);
    const type = document.getElementById('fin-type').value;
    if (!desc || isNaN(amount)) return;

    appData.finances.push({ id: Date.now(), desc, amount, type });
    saveAllData();
    renderFinances();
    showToast('Transaction recorded! ✨');
  };
}

function renderFinances() {
  const list = document.getElementById('fin-list');
  if (!list) return;
  list.innerHTML = '';
  let inc = 0, exp = 0;
  (appData.finances || []).forEach(f => {
    if (f.type === 'income') inc += f.amount;
    else exp += f.amount;
    const li = document.createElement('li');
    li.innerHTML = `<span>${f.desc}</span> <b>${f.type === 'income' ? '+' : '-'}₹${f.amount}</b>`;
    list.appendChild(li);
  });
  if (finChart) {
    finChart.data.datasets[0].data = [inc, exp];
    finChart.update();
  }
}

const addInvestBtn = document.getElementById('add-invest-btn');
if (addInvestBtn) {
  addInvestBtn.onclick = () => {
    const name = document.getElementById('invest-name').value;
    const amount = parseFloat(document.getElementById('invest-amount').value);
    const returns = parseFloat(document.getElementById('invest-returns').value);
    if (!name || isNaN(amount)) return;

    appData.investments.push({ id: Date.now(), name, amount, returns });
    saveAllData();
    renderInvestments();
    showToast('Asset added! ✨');
  };
}

function renderInvestments() {
  const list = document.getElementById('invest-list');
  if (!list) return;
  list.innerHTML = '';
  (appData.investments || []).forEach(inv => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${inv.name}</span> <b>Val: ₹${inv.returns}</b>`;
    list.appendChild(li);
  });
}

const calcGoalBtn = document.getElementById('calc-goal-btn');
if (calcGoalBtn) {
  calcGoalBtn.onclick = () => {
    const exp = parseFloat(document.getElementById('monthly-exp').value);
    const months = parseInt(document.getElementById('target-months').value);
    if (!isNaN(exp)) {
      document.getElementById('goal-result').textContent = `Target: ₹${(exp * months).toLocaleString()}`;
    }
  };
}

// --- BANK ACCOUNT AUTO SYNC FEATURE ---
const linkBankBtn = document.getElementById('link-bank-btn');
if (linkBankBtn) {
  linkBankBtn.onclick = () => {
    if (!currentUser || !currentUser.isPro) {
      showToast('Bank Account Sync is an AuraFlow Pro feature! 🚀');
      const proModal = document.getElementById('pro-modal');
      if (proModal) proModal.classList.remove('hidden');
      return;
    }

    const bankName = document.getElementById('bank-select').value;
    const accNum = document.getElementById('bank-acc-num').value.trim();

    if (!accNum) {
      alert("Please enter a valid Account Number or UPI ID.");
      return;
    }

    const statusMsg = document.getElementById('bank-status-msg');
    const bankDisplay = document.getElementById('connected-bank-name');
    if (statusMsg && bankDisplay) {
      bankDisplay.textContent = bankName;
      statusMsg.classList.remove('hidden');
    }

    const autoImportedTransactions = [
      { id: Date.now() + 1, desc: `Salary Credit (${bankName})`, amount: 45000, type: 'income' },
      { id: Date.now() + 2, desc: `SIP Investment (${bankName})`, amount: 5000, type: 'expense' },
      { id: Date.now() + 3, desc: `Utility & Wifi Bill (${bankName})`, amount: 1200, type: 'expense' }
    ];

    appData.finances.push(...autoImportedTransactions);
    saveAllData();
    renderFinances();
    showToast(`Connected to ${bankName}! Auto-imported 3 recent transactions 🏦✨`);
  };
}

// --- PRO CSV EXPORT HANDLER ---
const exportCsvBtn = document.getElementById('export-csv-btn');
if (exportCsvBtn) {
  exportCsvBtn.onclick = () => {
    if (!currentUser || !currentUser.isPro) {
      showToast('CSV Backup Export is an AuraFlow Pro feature! 🚀');
      const proModal = document.getElementById('pro-modal');
      if (proModal) proModal.classList.remove('hidden');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Category,Detail,Value\n";
    (appData.todos || []).forEach(t => { csvContent += `Task,"${t.text}",Pending\n`; });
    (appData.finances || []).forEach(f => { csvContent += `Finance,"${f.desc}",₹${f.amount} (${f.type})\n`; });
    (appData.journals || []).forEach(j => { csvContent += `Journal,"${j.title}",${j.mood}\n`; });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "AuraFlow_Sanctuary_Backup.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Backup Downloaded! 📄✨');
  };
}

// 8. ROUTINE BUILDER & WORKOUT TRACKER
const addRoutineBtn = document.getElementById('add-routine-btn');
if (addRoutineBtn) {
  addRoutineBtn.onclick = () => {
    const cat = document.getElementById('routine-category').value;
    const step = document.getElementById('routine-step-input').value.trim();
    if (!step) return;

    appData.routines.push({ id: Date.now(), category: cat, text: step, completed: false });
    document.getElementById('routine-step-input').value = '';
    saveAllData();
    renderRoutines();
    showToast('Routine step added! ✨');
  };
}

function renderRoutines() {
  const list = document.getElementById('routine-checklist');
  if (!list) return;
  list.innerHTML = '';
  (appData.routines || []).forEach(r => {
    const li = document.createElement('li');
    li.innerHTML = `
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" ${r.completed ? 'checked' : ''} onchange="toggleRoutine(${r.id})" />
        <span><b>[${r.category}]</b> ${r.text}</span>
      </label>
      <button onclick="deleteRoutine(${r.id})">🗑️</button>
    `;
    list.appendChild(li);
  });
  updateWellnessCharts();
}

function toggleRoutine(id) {
  const r = appData.routines.find(item => item.id === id);
  if (r) r.completed = !r.completed;
  saveAllData();
  updateWellnessCharts();
}

function deleteRoutine(id) {
  appData.routines = appData.routines.filter(item => item.id !== id);
  saveAllData();
  renderRoutines();
}

const addWorkoutBtn = document.getElementById('add-workout-btn');
if (addWorkoutBtn) {
  addWorkoutBtn.onclick = () => {
    const text = document.getElementById('workout-input').value.trim();
    if (!text) return;

    appData.workouts.push({ id: Date.now(), text, completed: false });
    document.getElementById('workout-input').value = '';
    saveAllData();
    renderWorkouts();
    showToast('Exercise added! ⚡');
  };
}

function renderWorkouts() {
  const list = document.getElementById('workout-checklist');
  if (!list) return;
  list.innerHTML = '';
  (appData.workouts || []).forEach(w => {
    const li = document.createElement('li');
    li.innerHTML = `
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" ${w.completed ? 'checked' : ''} onchange="toggleWorkout(${w.id})" />
        <span>${w.text}</span>
      </label>
      <button onclick="deleteWorkout(${w.id})">🗑️</button>
    `;
    list.appendChild(li);
  });
  updateWellnessCharts();
}

function toggleWorkout(id) {
  const w = appData.workouts.find(item => item.id === id);
  if (w) w.completed = !w.completed;
  saveAllData();
  updateWellnessCharts();
}

function deleteWorkout(id) {
  appData.workouts = appData.workouts.filter(item => item.id !== id);
  saveAllData();
  renderWorkouts();
}

// 9. WELLNESS, WATER & METRICS
const calcBmiBtn = document.getElementById('calc-bmi-btn');
if (calcBmiBtn) {
  calcBmiBtn.onclick = () => {
    const w = parseFloat(document.getElementById('weight-input').value);
    const h = parseFloat(document.getElementById('height-input').value) / 100;
    if (w > 0 && h > 0) {
      document.getElementById('bmi-result').textContent = `BMI: ${(w / (h * h)).toFixed(1)}`;
    }
  };
}

const saveMeasureBtn = document.getElementById('save-measure-btn');
if (saveMeasureBtn) {
  saveMeasureBtn.onclick = () => {
    appData.bodyMetrics = {
      shoulders: document.getElementById('m-shoulders').value,
      upperBust: document.getElementById('m-upper-bust') ? document.getElementById('m-upper-bust').value : '',
      lowerBust: document.getElementById('m-lower-bust') ? document.getElementById('m-lower-bust').value : '',
      chest: document.getElementById('m-chest') ? document.getElementById('m-chest').value : '',
      waist: document.getElementById('m-waist').value,
      hips: document.getElementById('m-hips').value,
      thighs: document.getElementById('m-thighs').value,
      calves: document.getElementById('m-calves').value,
      upperArm: document.getElementById('m-upper-arm').value,
      lowerArm: document.getElementById('m-lower-arm').value
    };
    saveAllData();
    showToast('Body metrics saved! 📏✨');
  };
}

const addWaterBtn = document.getElementById('add-water-btn');
if (addWaterBtn) {
  addWaterBtn.onclick = () => {
    appData.waterCount = (appData.waterCount || 0) + 1;
    saveAllData();
    updateWaterProgress();
    updateWellnessCharts();
    showToast('Stay hydrated! ✨');
  };
}

const subWaterBtn = document.getElementById('sub-water-btn');
if (subWaterBtn) {
  subWaterBtn.onclick = () => {
    if (appData.waterCount && appData.waterCount > 0) {
      appData.waterCount -= 1;
      saveAllData();
      updateWaterProgress();
      updateWellnessCharts();
      showToast('Water log reduced 💧');
    }
  };
}

const logCalorieBtn = document.getElementById('log-calorie-btn');
if (logCalorieBtn) {
  logCalorieBtn.onclick = () => {
    const cal = parseInt(document.getElementById('calorie-input').value);
    if (!isNaN(cal)) {
      appData.calories = (appData.calories || 0) + cal;
      saveAllData();
      document.getElementById('calorie-display').textContent = `Logged Today: ${appData.calories} kcal`;
      document.getElementById('calorie-input').value = '';
      updateWellnessCharts();
      showToast('Calories logged! ✨');
    }
  };
}

const resetCalorieBtn = document.getElementById('reset-calorie-btn');
if (resetCalorieBtn) {
  resetCalorieBtn.onclick = () => {
    appData.calories = 0;
    saveAllData();
    document.getElementById('calorie-display').textContent = `Logged Today: 0 kcal`;
    updateWellnessCharts();
    showToast('Calorie log reset 🔄');
  };
}

function updateWaterProgress() {
  const count = appData.waterCount || 0;
  const countEl = document.getElementById('water-count');
  if (countEl) countEl.textContent = `${count} / 8 Glasses`;
  const pct = Math.min((count / 8) * 100, 100);
  const bar = document.getElementById('water-progress-bar');
  if (bar) bar.style.width = `${pct}%`;
}

// ANALYTICS CHARTS
let wellnessChart1, wellnessChart2;
function initWellnessCharts() {
  const ctx1 = document.getElementById('wellnessChart1');
  const ctx2 = document.getElementById('wellnessChart2');
  if (!ctx1 || !ctx2) return;
  
  wellnessChart1 = new Chart(ctx1.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Water (Glasses)', 'Calories (x10 kcal)'],
      datasets: [{ label: 'Daily Nutrition', data: [appData.waterCount || 0, (appData.calories || 0) / 10], backgroundColor: ['#2563EB', '#6C5CE7'] }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });

  wellnessChart2 = new Chart(ctx2.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Completed Routines', 'Pending Routines', 'Completed Workouts', 'Pending Workouts'],
      datasets: [{
        data: [
          (appData.routines || []).filter(r => r.completed).length,
          (appData.routines || []).filter(r => !r.completed).length,
          (appData.workouts || []).filter(w => w.completed).length,
          (appData.workouts || []).filter(w => !w.completed).length
        ],
        backgroundColor: ['#00B894', '#E2E8F0', '#E84393', '#CBD5E1']
      }]
    }
  });
}

function updateWellnessCharts() {
  if (wellnessChart1) {
    wellnessChart1.data.datasets[0].data = [appData.waterCount || 0, (appData.calories || 0) / 10];
    wellnessChart1.update();
  }
  if (wellnessChart2) {
    wellnessChart2.data.datasets[0].data = [
      (appData.routines || []).filter(r => r.completed).length,
      (appData.routines || []).filter(r => !r.completed).length,
      (appData.workouts || []).filter(w => w.completed).length,
      (appData.workouts || []).filter(w => !w.completed).length
    ];
    wellnessChart2.update();
  }
}

// PRO PLAN & PAYMENT
let selectedPlan = { type: 'annual', price: 1499, name: 'Annual Pro ✨' };

function selectPlan(planType) {
  const monthlyCard = document.getElementById('plan-monthly');
  const annualCard = document.getElementById('plan-annual');
  const proceedBtn = document.getElementById('proceed-payment-btn');

  if (planType === 'monthly') {
    if (monthlyCard) monthlyCard.classList.add('selected');
    if (annualCard) annualCard.classList.remove('selected');
    selectedPlan = { type: 'monthly', price: 299, name: 'Monthly Pass' };
    if (proceedBtn) proceedBtn.textContent = 'Proceed to Payment (₹299) ✨';
  } else {
    if (annualCard) annualCard.classList.add('selected');
    if (monthlyCard) monthlyCard.classList.remove('selected');
    selectedPlan = { type: 'annual', price: 1499, name: 'Annual Pro ✨' };
    if (proceedBtn) proceedBtn.textContent = 'Proceed to Payment (₹1,499) ✨';
  }
}

function openPaymentModal() {
  const proModal = document.getElementById('pro-modal');
  const payModal = document.getElementById('payment-modal');
  const summaryEl = document.getElementById('payment-plan-summary');

  if (proModal) proModal.classList.add('hidden');
  if (payModal) payModal.classList.remove('hidden');
  if (summaryEl) summaryEl.textContent = `Selected Plan: ${selectedPlan.name} (₹${selectedPlan.price.toLocaleString()})`;
}

function closePaymentModal() {
  const payModal = document.getElementById('payment-modal');
  if (payModal) payModal.classList.add('hidden');
}

function togglePayMethod(method) {
  const upiForm = document.getElementById('upi-form');
  const cardForm = document.getElementById('card-form');
  if (method === 'upi') {
    if (upiForm) upiForm.classList.remove('hidden');
    if (cardForm) cardForm.classList.add('hidden');
  } else {
    if (cardForm) cardForm.classList.remove('hidden');
    if (upiForm) upiForm.classList.add('hidden');
  }
}

function processPayment() {
  closePaymentModal();
  showToast('Payment Successful! AuraFlow Pro Unlocked! 🎉✨');
  if (currentUser) {
    currentUser.isPro = true;
    saveAllData();
  }
  updateBrandTitle();
}

// AI COACH & JOURNALS
const aiKnowledgeBase = [
  { keywords: ['coding', 'study', 'exam', 'focus'], response: "To boost focus, try the Pomodoro Technique: 25 mins of deep focus followed by a 5 min break. Consistency beats intensity! ⚡" },
  { keywords: ['habit', 'streak', 'routine'], response: "Habit stacking works best! Pair a new habit with an existing one (e.g., 'After I drink my morning tea, I will write 1 journal entry'). ✨" },
  { keywords: ['money', 'finance', 'budget', 'save'], response: "Follow the 50/30/20 rule: 50% Needs, 30% Wants, and 20% Savings/Investments. Check your Finance Engine tab! 💸" },
  { keywords: ['workout', 'muscle', 'gym', 'chest', 'biceps'], response: "Focus on progressive overload and hit 1.6g-2g of protein per kg of body weight for optimal recovery! 💪" }
];

const aiSendBtn = document.getElementById('ai-send-btn');
if (aiSendBtn) {
  aiSendBtn.onclick = () => {
    const inputEl = document.getElementById('ai-user-input');
    const userText = inputEl ? inputEl.value.trim().toLowerCase() : '';
    if (!userText) return;

    const chatContainer = document.getElementById('ai-chat-box');
    if (chatContainer) {
      const userMsg = document.createElement('div');
      userMsg.className = 'ai-message user';
      userMsg.textContent = inputEl.value;
      chatContainer.appendChild(userMsg);
      inputEl.value = '';
      chatContainer.scrollTop = chatContainer.scrollHeight;

      setTimeout(() => {
        let matchedResponse = "That's a great goal! Keep tracking your daily habits and progress in AuraFlow to build momentum. ✨";
        for (let item of aiKnowledgeBase) {
          if (item.keywords.some(kw => userText.includes(kw))) {
            matchedResponse = item.response;
            break;
          }
        }
        const botMsg = document.createElement('div');
        botMsg.className = 'ai-message bot';
        botMsg.textContent = `⚡ ${matchedResponse}`;
        chatContainer.appendChild(botMsg);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 800);
    }
  };
}

const saveJournalBtn = document.getElementById('save-journal-btn');
if (saveJournalBtn) {
  saveJournalBtn.onclick = () => {
    const title = document.getElementById('journal-title').value;
    const mood = document.getElementById('journal-mood').value;
    const content = document.getElementById('journal-content').value;
    if (!content) return;

    appData.journals.push({ id: Date.now(), title: title || 'Reflection', mood, content });
    saveAllData();
    renderJournals();
    document.getElementById('journal-title').value = '';
    document.getElementById('journal-content').value = '';
    showToast('Journal saved! ✨');
  };
}

function renderJournals() {
  const grid = document.getElementById('journal-grid');
  if (!grid) return;
  grid.innerHTML = '';
  (appData.journals || []).forEach(j => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `<h4>${j.title} <span>(${j.mood})</span></h4><p>${j.content}</p>`;
    grid.appendChild(card);
  });
}

// HELPERS
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

function saveAllData() {
  if (activeUserEmail) {
    userDatabase[activeUserEmail] = {
      profile: currentUser,
      sanctuaryData: appData
    };
    localStorage.setItem('auraFlowUserDatabase', JSON.stringify(userDatabase));
    localStorage.setItem('auraFlowActiveEmail', activeUserEmail);
  }
}

function renderAllData() {
  renderTodos();
  renderHabits();
  renderEvents();
  renderFinances();
  renderInvestments();
  renderJournals();
  renderRoutines();
  renderWorkouts();
  updateWaterProgress();
  if (appData.calories) {
    const calEl = document.getElementById('calorie-display');
    if (calEl) calEl.textContent = `Logged Today: ${appData.calories} kcal`;
  }
}