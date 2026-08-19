# AuraFlow ✨ — Personal Growth & Productivity Suite

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-222222?logo=github)

A dynamic, responsive single-page web application designed to merge daily habit building, financial tracking, personal wellness routines, and real-time health analytics into a unified, aesthetic sanctuary.

---

## 🚀 Live Demo & Repository

* 🔗 **Live Interactive App:** [https://ishita-sarkar2004.github.io/AuraFlow/](https://ishita-sarkar2004.github.io/AuraFlow/)
* 💻 **GitHub Repository:** [https://github.com/Ishita-Sarkar2004/AuraFlow](https://github.com/Ishita-Sarkar2004/AuraFlow)

---

## 🌟 Key Features

* ⚡ **Task & Productivity Suite:** Interactive to-do lists, habit streak counters (`🔥`), and an event schedule planner.
* 💸 **Finance & Budget Engine:** Income and expense cash-flow logging, investment portfolio valuation, emergency fund target calculator, and a simulated **Automated Bank Account Sync (Pro)** workflow.
* 🌸 **Adaptive Wellness & Health Suite:**
  * **Gender-Adaptive UI:** Automatically tailors routines and visual themes (Pastel Pink for female profiles, Slate Blue for male profiles).
  * **Custom Care Routines:** Skincare, haircare, and grooming checklists.
  * **Fitness & Fasting:** Customizable workout tracker, intermittent fasting timer, and daily calorie logging.
  * **Body Metrics & BMI:** Full anatomical measurement tracker and instant BMI calculator.
  * **Hydration Counter:** Interactive water intake logger with dynamic CSS progress bar visualization.
* 📊 **Multi-Metric Chart Analytics:** Real-time visual data rendering powered by **Chart.js** (Cash flow doughnut charts and nutrition/workout analytics).
* 🤖 **Aura AI Habit Coach:** Interactive simulator offering real-time mindset, productivity, and fitness recommendations.
* 💾 **Data Persistence & Pro Export:** Browser-based storage indexed per user account via `localStorage`, featuring **Canvas Base64 image compression** for profile avatars and **CSV data export**.

---

## 🛠️ Technical Architecture & Highlights

* **Client-Side State Management:** Implements an email-indexed local database schema with session pointer validation, ensuring persistent multi-user accounts without external backend dependencies.
* **Canvas Image Compression Pipeline:** Utilizes the HTML5 Canvas API and `FileReader` to downscale uploaded profile images to $150 \times 150\text{ px}$ at 80% quality, preventing `localStorage` 5MB quota overflow.
* **Reactive CSS Theming:** Built with CSS Custom Properties (`:root` variables) allowing zero-latency runtime theme switches across default pastel, masculine slate blue, mint, sunset, and midnight dark modes.

---

## 💻 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Ishita-Sarkar2004/AuraFlow.git](https://github.com/Ishita-Sarkar2004/AuraFlow.git)

## 📜 License

This project is licensed under the MIT License — see the LICENSE file for details.

© 2026 Ishita Sarkar. All rights reserved.
