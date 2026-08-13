// ==========================================
// 🌌 AuraFlow — Complete Unified Application Script
// ==========================================

// --- STATE MANAGEMENT ---
// Global database mapping users by email address
let userDatabase = JSON.parse(localStorage.getItem('auraFlowUserDatabase')) || {};

// Active user session email
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
});

// 1. AUTHENTICATION & EMAIL-BASED PERSISTENCE
function checkAuth() {
  const portal = document.getElementById('auth-portal');
  if (!currentUser) {
    portal.classList.remove('hidden');
  } else {
    portal.classList.add('hidden');
    updateUserBadge();
    applyGenderContext();
    updateBrandTitle();
  }

  document.getElementById('tab-login-btn').onclick = () => {
    document.getElementById('tab-login-btn').classList.add('active');
    document.getElementById('tab-signup-btn').classList.remove('active');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('signup-form').classList.add('hidden');
  };

  document.getElementById('tab-signup-btn').onclick = () => {
    document.getElementById('tab-signup-btn').classList.add('active');
    document.getElementById('tab-login-btn').classList.remove('active');
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
  };

  // SIGNUP FORM HANDLER
  document.getElementById('signup-form').onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const genderChoice = document.getElementById('signup-gender').value;

    currentUser = {
      name: document.getElementById('signup-name').value,
      email: email,
      age: document.getElementById('signup-age').value,
      gender: genderChoice,
      photo: null,
      isPro: false
    };

    activeUserEmail = email;

    // Reset default sanctuary data for new user
    appData = {
      todos: [], habits: [], events: [], finances: [], investments: [],
      journals: [], routines: [], workouts: [], bodyMetrics: {},
      waterCount: 0, calories: 0,
      theme: genderChoice === 'male' ? 'theme-masculine' : 'theme-default'
    };

    saveAllData();
    portal.classList.add('hidden');
    applyStoredTheme();
    updateUserBadge();
    applyGenderContext();
    updateBrandTitle();
    renderAllData();
    showToast('Welcome to AuraFlow! ✨');
  };

  // LOGIN FORM HANDLER (Retrieves saved user data by Email!)
  document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();

    if (userDatabase[email]) {
      activeUserEmail = email;
      loadActiveUserData();
      showToast('Welcome back to your Sanctuary! ✨');
    } else {
      // Create new account if email doesn't exist yet
      currentUser = { name: email.split('@')[0], email: email, age: '22', gender: 'female', photo: null, isPro: false };
      activeUserEmail = email;
      appData.theme = 'theme-default';
      showToast('Account created! Welcome back! ✨');
    }

    saveAllData();
    portal.classList.add('hidden');
    applyStoredTheme();
    updateUserBadge();
    applyGenderContext();
    updateBrandTitle();
    renderAllData();
  };
}

function updateBrandTitle() {
  const proTag = document.getElementById('pro-tag');
  if (currentUser && currentUser.isPro) {
    proTag.classList.remove('hidden');
    proTag.style.background = 'linear-gradient(135deg, #00B894, #55E6C1)';
    proTag.textContent = 'PRO';
  } else {
    proTag.classList.add('hidden');
  }
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

// 3. OPTIMIZED PROFILE EDIT & COMPRESSED AVATAR UPLOAD
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

document.getElementById('edit-profile-form').onsubmit = function(e) {
  e.preventDefault();
  currentUser.name = document.getElementById('edit-name').value;
  currentUser.age = document.getElementById('edit-age').value;
  currentUser.gender = document.getElementById('edit-gender').value;

  const photoInput = document.getElementById('edit-photo-file');
  if (photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      // Compress image using an HTML5 Canvas to prevent LocalStorage memory overflow
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize to 150x150 thumbnail
        canvas.width = 150;
        canvas.height = 150;
        ctx.drawImage(img, 0, 0, 150, 150);
        
        // Save ultra-lightweight JPEG string
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

function updateUserBadge() {
  if (currentUser) {
    document.getElementById('display-user-name').textContent = currentUser.name;
    document.getElementById('display-user-meta').textContent = `${currentUser.age} yrs • ${currentUser.gender}`;
    document.getElementById('settings-email-display').textContent = currentUser.email || 'User';

    const avatarImg = document.getElementById('user-avatar-img');
    const avatarEmoji = document.getElementById('user-avatar-emoji');

    if (currentUser.photo) {
      avatarImg.src = currentUser.photo;
      avatarImg.classList.remove('hidden');
      avatarEmoji.classList.add('hidden');
    } else {
      avatarImg.classList.add('hidden');
      avatarEmoji.classList.remove('hidden');
    }
  }
}

// DYNAMIC GENDER & ROUTINE ADAPTATION
function applyGenderContext() {
  if (!currentUser) return;
  const isMale = currentUser.gender === 'male';

  const femaleCard = document.getElementById('female-routine-card');
  const femaleBustGroup = document.getElementById('female-bust-group');
  const maleChestGroup = document.getElementById('male-chest-group');
  const routineCatSelect = document.getElementById('routine-category');

  if (isMale) {
    if (femaleCard) femaleCard.classList.add('hidden');
    if (femaleBustGroup) femaleBustGroup.classList.add('hidden');
    if (maleChestGroup) maleChestGroup.classList.remove('hidden');

    document.getElementById('nav-wellness-btn').querySelector('.nav-text').textContent = 'Athletic & Wellness';
    document.getElementById('nav-wellness-btn').querySelector('.nav-icon').textContent = '🏋️‍♂️';
    document.getElementById('well-title').textContent = '🏋️‍♂️ Athletic & Fitness Suite ⚡';
    document.getElementById('fitness-card-title').textContent = '💪 Athletic Fitness, Fasting & Calories';
    if (!currentUser.photo) document.getElementById('user-avatar-emoji').textContent = '⚡';

    // MALE DYNAMIC ROUTINE DROPDOWN (Includes Grooming/Beard)
    routineCatSelect.innerHTML = `
      <option value="Grooming">Grooming & Beard 🧔</option>
      <option value="Skincare">Skincare 🧴</option>
      <option value="Body Care">Body Care 🌸</option>
      <option value="Hair Care">Hair Care 💇‍♂️</option>
    `;
  } else {
    if (femaleCard) femaleCard.classList.remove('hidden');
    if (femaleBustGroup) femaleBustGroup.classList.remove('hidden');
    if (maleChestGroup) maleChestGroup.classList.add('hidden');

    document.getElementById('nav-wellness-btn').querySelector('.nav-text').textContent = 'Wellness & Lifestyle';
    document.getElementById('nav-wellness-btn').querySelector('.nav-icon').textContent = '🌸';
    document.getElementById('well-title').textContent = '🌸 Wellness & Lifestyle Suite ✨';
    document.getElementById('fitness-card-title').textContent = '🏃 Fitness, Fasting & Calories';
    if (!currentUser.photo) document.getElementById('user-avatar-emoji').textContent = '✨';

    // FEMALE DYNAMIC ROUTINE DROPDOWN (Strictly No Beard Option!)
    routineCatSelect.innerHTML = `
      <option value="Skincare">Skincare 🧴</option>
      <option value="Body Care">Body Care 🌸</option>
      <option value="Hair Care">Hair Care 💆‍♀️</option>
    `;
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
  if (appData.theme) {
    document.body.className = appData.theme;
  }
}

document.getElementById('logout-btn').onclick = () => {
  activeUserEmail = null;
  localStorage.removeItem('auraFlowActiveEmail'); // Clears session, keeps user Database safe!
  location.reload();
};

document.getElementById('reset-data-btn').onclick = () => {
  if (confirm('Are you sure you want to reset all sanctuary data for this account?')) {
    if (activeUserEmail && userDatabase[activeUserEmail]) {
      delete userDatabase[activeUserEmail];
      localStorage.setItem('auraFlowUserDatabase', JSON.stringify(userDatabase));
    }
    localStorage.removeItem('auraFlowActiveEmail');
    location.reload();
  }
};

// 5. TAB NAVIGATION
function initTabNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabViews = document.querySelectorAll('.tab-view');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });

  document.getElementById('upgrade-pro-btn').onclick = () => {
    document.getElementById('pro-modal').classList.remove('hidden');
  };
  document.getElementById('close-pro-btn').onclick = () => {
    document.getElementById('pro-modal').classList.add('hidden');
  };
}

// 6. TASKS & HABITS
document.getElementById('add-todo-btn').onclick = () => {
  const input = document.getElementById('todo-input');
  if (!input.value.trim()) return;
  appData.todos.push({ id: Date.now(), text: input.value.trim() });
  input.value = '';
  saveAllData();
  renderTodos();
  showToast('Goal added! ✨');
};

function renderTodos() {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  appData.todos.forEach(todo => {
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

document.getElementById('add-habit-btn').onclick = () => {
  const input = document.getElementById('habit-input');
  if (!input.value.trim()) return;
  appData.habits.push({ id: Date.now(), text: input.value.trim(), streak: 0 });
  input.value = '';
  saveAllData();
  renderHabits();
  showToast('Habit ritual created! ✨');
};

function renderHabits() {
  const list = document.getElementById('habit-list');
  list.innerHTML = '';
  appData.habits.forEach(habit => {
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

document.getElementById('add-event-btn').onclick = () => {
  const date = document.getElementById('event-date').value;
  const desc = document.getElementById('event-desc').value;
  if (!date || !desc) return;
  appData.events.push({ id: Date.now(), date, desc });
  saveAllData();
  renderEvents();
  showToast('Event scheduled! ✨');
};

function renderEvents() {
  const list = document.getElementById('event-list');
  list.innerHTML = '';
  appData.events.forEach(ev => {
    const li = document.createElement('li');
    li.innerHTML = `<span>📅 <b>${ev.date}:</b> ${ev.desc}</span>`;
    list.appendChild(li);
  });
}

// 7. FINANCE
let finChart;
function initCharts() {
  const ctx = document.getElementById('financeChart').getContext('2d');
  finChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: ['Income', 'Expenses'], datasets: [{ data: [0, 0], backgroundColor: ['#00B894', '#FF7675'] }] }
  });
  initWellnessCharts();
}

document.getElementById('add-fin-btn').onclick = () => {
  const desc = document.getElementById('fin-desc').value;
  const amount = parseFloat(document.getElementById('fin-amount').value);
  const type = document.getElementById('fin-type').value;
  if (!desc || isNaN(amount)) return;

  appData.finances.push({ id: Date.now(), desc, amount, type });
  saveAllData();
  renderFinances();
  showToast('Transaction recorded! ✨');
};

function renderFinances() {
  const list = document.getElementById('fin-list');
  list.innerHTML = '';
  let inc = 0, exp = 0;
  appData.finances.forEach(f => {
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

document.getElementById('add-invest-btn').onclick = () => {
  const name = document.getElementById('invest-name').value;
  const amount = parseFloat(document.getElementById('invest-amount').value);
  const returns = parseFloat(document.getElementById('invest-returns').value);
  if (!name || isNaN(amount)) return;

  appData.investments.push({ id: Date.now(), name, amount, returns });
  saveAllData();
  renderInvestments();
  showToast('Asset added! ✨');
};

function renderInvestments() {
  const list = document.getElementById('invest-list');
  list.innerHTML = '';
  appData.investments.forEach(inv => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${inv.name}</span> <b>Val: ₹${inv.returns}</b>`;
    list.appendChild(li);
  });
}

document.getElementById('calc-goal-btn').onclick = () => {
  const exp = parseFloat(document.getElementById('monthly-exp').value);
  const months = parseInt(document.getElementById('target-months').value);
  if (!isNaN(exp)) {
    document.getElementById('goal-result').textContent = `Target: ₹${(exp * months).toLocaleString()}`;
  }
};

// 8. ROUTINE BUILDER & WORKOUT TRACKER
document.getElementById('add-routine-btn').onclick = () => {
  const cat = document.getElementById('routine-category').value;
  const step = document.getElementById('routine-step-input').value.trim();
  if (!step) return;

  appData.routines.push({ id: Date.now(), category: cat, text: step, completed: false });
  document.getElementById('routine-step-input').value = '';
  saveAllData();
  renderRoutines();
  showToast('Routine step added! ✨');
};

function renderRoutines() {
  const list = document.getElementById('routine-checklist');
  list.innerHTML = '';
  appData.routines.forEach(r => {
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

document.getElementById('add-workout-btn').onclick = () => {
  const text = document.getElementById('workout-input').value.trim();
  if (!text) return;

  appData.workouts.push({ id: Date.now(), text, completed: false });
  document.getElementById('workout-input').value = '';
  saveAllData();
  renderWorkouts();
  showToast('Exercise added! ⚡');
};

function renderWorkouts() {
  const list = document.getElementById('workout-checklist');
  list.innerHTML = '';
  appData.workouts.forEach(w => {
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
document.getElementById('calc-bmi-btn').onclick = () => {
  const w = parseFloat(document.getElementById('weight-input').value);
  const h = parseFloat(document.getElementById('height-input').value) / 100;
  if (w > 0 && h > 0) {
    document.getElementById('bmi-result').textContent = `BMI: ${(w / (h * h)).toFixed(1)}`;
  }
};

document.getElementById('save-measure-btn').onclick = () => {
  appData.bodyMetrics = {
    shoulders: document.getElementById('m-shoulders').value,
    upperBust: document.getElementById('m-upper-bust').value,
    lowerBust: document.getElementById('m-lower-bust').value,
    chest: document.getElementById('m-chest').value,
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

document.getElementById('add-water-btn').onclick = () => {
  appData.waterCount = (appData.waterCount || 0) + 1;
  saveAllData();
  updateWaterProgress();
  updateWellnessCharts();
  showToast('Stay hydrated! ✨');
};

document.getElementById('sub-water-btn').onclick = () => {
  if (appData.waterCount && appData.waterCount > 0) {
    appData.waterCount -= 1;
    saveAllData();
    updateWaterProgress();
    updateWellnessCharts();
    showToast('Water log reduced 💧');
  }
};

document.getElementById('log-calorie-btn').onclick = () => {
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

document.getElementById('reset-calorie-btn').onclick = () => {
  appData.calories = 0;
  saveAllData();
  document.getElementById('calorie-display').textContent = `Logged Today: 0 kcal`;
  updateWellnessCharts();
  showToast('Calorie log reset 🔄');
};

function updateWaterProgress() {
  const count = appData.waterCount || 0;
  document.getElementById('water-count').textContent = `${count} / 8 Glasses`;
  const pct = Math.min((count / 8) * 100, 100);
  document.getElementById('water-progress-bar').style.width = `${pct}%`;
}

// 📊 DETAILED ANALYTICS CHARTS
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

// --- PRO PLAN & PAYMENT ---
let selectedPlan = { type: 'annual', price: 1499, name: 'Annual Pro ✨' };

function selectPlan(planType) {
  const monthlyCard = document.getElementById('plan-monthly');
  const annualCard = document.getElementById('plan-annual');
  const proceedBtn = document.getElementById('proceed-payment-btn');

  if (planType === 'monthly') {
    monthlyCard.classList.add('selected');
    annualCard.classList.remove('selected');
    selectedPlan = { type: 'monthly', price: 299, name: 'Monthly Pass' };
    proceedBtn.textContent = 'Proceed to Payment (₹299) ✨';
  } else {
    annualCard.classList.add('selected');
    monthlyCard.classList.remove('selected');
    selectedPlan = { type: 'annual', price: 1499, name: 'Annual Pro ✨' };
    proceedBtn.textContent = 'Proceed to Payment (₹1,499) ✨';
  }
}

function openPaymentModal() {
  document.getElementById('pro-modal').classList.add('hidden');
  document.getElementById('payment-modal').classList.remove('hidden');
  document.getElementById('payment-plan-summary').textContent = `Selected Plan: ${selectedPlan.name} (₹${selectedPlan.price.toLocaleString()})`;
}

function closePaymentModal() {
  document.getElementById('payment-modal').classList.add('hidden');
}

function togglePayMethod(method) {
  const upiForm = document.getElementById('upi-form');
  const cardForm = document.getElementById('card-form');
  if (method === 'upi') {
    upiForm.classList.remove('hidden');
    cardForm.classList.add('hidden');
  } else {
    cardForm.classList.remove('hidden');
    upiForm.classList.add('hidden');
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

// --- AI COACH & JOURNALS ---
const aiKnowledgeBase = [
  { keywords: ['coding', 'study', 'exam', 'focus'], response: "To boost focus, try the Pomodoro Technique: 25 mins of deep focus followed by a 5 min break. Consistency beats intensity! ⚡" },
  { keywords: ['habit', 'streak', 'routine'], response: "Habit stacking works best! Pair a new habit with an existing one (e.g., 'After I drink my morning tea, I will write 1 journal entry'). ✨" },
  { keywords: ['money', 'finance', 'budget', 'save'], response: "Follow the 50/30/20 rule: 50% Needs, 30% Wants, and 20% Savings/Investments. Check your Finance Engine tab! 💸" },
  { keywords: ['workout', 'muscle', 'gym', 'chest', 'biceps'], response: "Focus on progressive overload and hit 1.6g-2g of protein per kg of body weight for optimal recovery! 💪" }
];

document.getElementById('ai-send-btn').onclick = () => {
  const inputEl = document.getElementById('ai-user-input');
  const userText = inputEl.value.trim().toLowerCase();
  if (!userText) return;

  const chatContainer = document.getElementById('ai-chat-box');
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
};

document.getElementById('save-journal-btn').onclick = () => {
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

function renderJournals() {
  const grid = document.getElementById('journal-grid');
  grid.innerHTML = '';
  appData.journals.forEach(j => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `<h4>${j.title} <span>(${j.mood})</span></h4><p>${j.content}</p>`;
    grid.appendChild(card);
  });
}

document.getElementById('export-csv-btn').onclick = () => {
  let csvContent = "data:text/csv;charset=utf-8,Category,Detail,Value\n";
  appData.todos.forEach(t => { csvContent += `Task,"${t.text}",Pending\n`; });
  appData.finances.forEach(f => { csvContent += `Finance,"${f.desc}",₹${f.amount} (${f.type})\n`; });
  appData.journals.forEach(j => { csvContent += `Journal,"${j.title}",${j.mood}\n`; });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "AuraFlow_Sanctuary_Backup.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('CSV Backup Downloaded! 📄✨');
};

// HELPERS
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

// SAVES PROFILE AND LOGS UNDER EMAIL DATABASE MAP
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
    document.getElementById('calorie-display').textContent = `Logged Today: ${appData.calories} kcal`;
  }
}