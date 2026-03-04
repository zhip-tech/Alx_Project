const API_URL = "http://localhost:8000/api"; // Change this to your backend URL

// ---- Registration ----
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    document.getElementById("message").innerText = data.message || JSON.stringify(data);
    if (res.ok) window.location.href = "index.html";
  });
}

// ---- Login ----
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("message").innerText = data.message || "Login failed";
    }
  });
}

// ---- Logout ----
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });
}

// ---- Courses ----
const courseForm = document.getElementById("courseForm");
const courseList = document.getElementById("courseList");

async function fetchCourses() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/courses/`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const data = await res.json();
  courseList.innerHTML = "";
  data.forEach(course => {
    const li = document.createElement("li");
    li.innerText = `${course.course_name} (${course.course_code})`;
    courseList.appendChild(li);
  });
}

if (courseForm) {
  courseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const courseName = document.getElementById("courseName").value;
    const courseCode = document.getElementById("courseCode").value;

    await fetch(`${API_URL}/courses/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ course_name: courseName, course_code: courseCode }),
    });

    document.getElementById("courseName").value = "";
    document.getElementById("courseCode").value = "";
    fetchCourses();
  });

  fetchCourses();
}

// ---- Study Plans ----
const studyPlanForm = document.getElementById("studyPlanForm");
const studyPlanList = document.getElementById("studyPlanList");

async function fetchStudyPlans() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/study-plans/`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const data = await res.json();
  studyPlanList.innerHTML = "";
  data.forEach(plan => {
    const li = document.createElement("li");
    li.innerText = `${plan.title} - ${plan.date}`;
    studyPlanList.appendChild(li);
  });
}

if (studyPlanForm) {
  studyPlanForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const title = document.getElementById("planTitle").value;
    const date = document.getElementById("planDate").value;

    await fetch(`${API_URL}/study-plans/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title, date }),
    });

    document.getElementById("planTitle").value = "";
    document.getElementById("planDate").value = "";
    fetchStudyPlans();
  });

  fetchStudyPlans();
}