// ===============================
// Django Backend URL
// ===============================
const API_URL = "http://127.0.0.1:8000/api/auth";

// ===============================
// Token Helpers
// ===============================
function saveToken(token) {
  localStorage.setItem("authToken", token);
}

function getToken() {
  return localStorage.getItem("authToken");
}

// ===============================
// Message Display
// ===============================
function showMessage(msg, isError = true) {
  const messageDiv = document.getElementById("message");

  if (messageDiv) {
    messageDiv.textContent = msg;
    messageDiv.style.color = isError ? "red" : "green";
  }
}

// ===============================
// Redirect if already logged in
// ===============================
if (
  window.location.pathname.endsWith("index.html") ||
  window.location.pathname.endsWith("register.html")
) {
  if (getToken()) {
    window.location.href = "dashboard.html";
  }
}

// ===============================
// REGISTRATION
// ===============================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email || !password) {
      showMessage("All fields are required");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("Registration successful! Redirecting to login...", false);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        showMessage(data.error || "Registration failed");
      }
    } catch (err) {
      showMessage("Error connecting to server");
      console.error(err);
    }
  });
}

// ===============================
// LOGIN
// ===============================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      showMessage("Email and password are required");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && (data.token || data.access)) {
        const token = data.token || data.access;
        saveToken(token);
        window.location.href = "dashboard.html";
      } else {
        showMessage(data.error || "Invalid credentials");
      }
    } catch (err) {
      showMessage("Error connecting to server");
      console.error(err);
    }
  });
}

// ===============================
// LOGOUT
// ===============================
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    window.location.href = "index.html";
  });
}

// ===============================
// DASHBOARD STUDY PLAN SYSTEM
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const addPlanForm = document.getElementById("addPlanForm");
  const plansContainer = document.getElementById("plansContainer");
  const addMessage = document.getElementById("addMessage");

  if (!addPlanForm || !plansContainer) return;

  let plans = JSON.parse(localStorage.getItem("studyPlans")) || [];

  // Render function with status + timestamp
  const renderPlans = () => {
    plansContainer.innerHTML = "";

    if (plans.length === 0) {
      plansContainer.innerHTML = "<p>No study plans yet. Add one above!</p>";
      return;
    }

    plans.forEach((plan, index) => {
      const card = document.createElement("div");
      card.className = "plan-card" + (plan.completed ? " completed" : "");

      card.innerHTML = `
        <h3>${plan.courseTitle}</h3>
        <p><strong>Plan:</strong> ${plan.planTitle}</p>
        <p><strong>Date:</strong> ${plan.planDate}</p>
        <p><strong>Status:</strong> <span class="status-text">${plan.completed ? "Completed" : "Pending"}</span></p>
        <p class="completed-timestamp">${plan.completed ? "Completed on: " + plan.completedTimestamp : ""}</p>
        <button class="toggleCompleteBtn">${plan.completed ? "Mark Incomplete" : "Mark Complete"}</button>
        <button onclick="deletePlan(${index})">Delete</button>
      `;

      plansContainer.appendChild(card);

      // Toggle Complete/Incomplete with timestamp
      const toggleBtn = card.querySelector(".toggleCompleteBtn");
      toggleBtn.addEventListener("click", () => {
        plan.completed = !plan.completed;

        if (plan.completed) {
          const now = new Date();
          plan.completedTimestamp = now.toLocaleString(); // store timestamp
        } else {
          plan.completedTimestamp = ""; // clear timestamp when reverted
        }

        localStorage.setItem("studyPlans", JSON.stringify(plans));
        renderPlans();
      });
    });
  };

  renderPlans();

  addPlanForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const courseTitle = document.getElementById("courseTitle").value.trim();
    const planTitle = document.getElementById("planTitle").value.trim();
    const planDate = document.getElementById("planDate").value;

    if (!courseTitle || !planTitle || !planDate) {
      addMessage.textContent = "All fields are required!";
      return;
    }

    const newPlan = {
      courseTitle,
      planTitle,
      planDate,
      completed: false, // default status
      completedTimestamp: "", // default empty
    };

    plans.push(newPlan);
    localStorage.setItem("studyPlans", JSON.stringify(plans));
    renderPlans();

    addPlanForm.reset();
    addMessage.textContent = "Plan added successfully!";

    setTimeout(() => {
      addMessage.textContent = "";
    }, 3000);
  });

  // Delete function
  window.deletePlan = function (index) {
    plans.splice(index, 1);
    localStorage.setItem("studyPlans", JSON.stringify(plans));
    renderPlans();
  };
});