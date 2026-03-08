const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const addPlanForm = document.getElementById("addPlanForm");
const plansContainer = document.getElementById("plansContainer");
const addMessage = document.getElementById("addMessage");

function saveToken(token) { localStorage.setItem("authToken", token); }
function getToken() { return localStorage.getItem("authToken"); }
function showMessage(msg, isError = true, targetId = "message") {
  const el = document.getElementById(targetId); if(el) { el.textContent = msg; el.style.color = isError ? "red" : "green"; }
}

// -------- Register --------
if(registerForm){
  registerForm.addEventListener("submit", async e=>{
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if(!username || !email || !password){ showMessage("All fields required"); return; }
    try{
      const res = await fetch("/auth/register/",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({username,email,password})
      });
      const data = await res.json();
      if(res.ok){ showMessage("Registered! Redirecting...", false); setTimeout(()=>window.location.href="/",1500); }
      else showMessage(data.error||"Registration failed");
    }catch(err){ showMessage("Error connecting to server"); console.error(err);}
  });
}

// -------- Login --------
if(loginForm){
  loginForm.addEventListener("submit", async e=>{
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if(!email||!password){ showMessage("Email & password required"); return;}
    try{
      const res = await fetch("/auth/login/",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password})
      });
      const data = await res.json();
      if(res.ok && data.token){ saveToken(data.token); window.location.href="/dashboard/";}
      else showMessage(data.error||"Invalid credentials");
    }catch(err){ showMessage("Error connecting to server"); console.error(err);}
  });
}

// -------- Dashboard Study Plans --------
document.addEventListener("DOMContentLoaded", ()=>{
  if(!addPlanForm || !plansContainer) return;
  let plans = [];

  const renderPlans = ()=>{
    plansContainer.innerHTML = "";
    if(plans.length===0){ plansContainer.innerHTML="<p>No study plans yet!</p>"; return; }
    plans.forEach((plan,index)=>{
      const card = document.createElement("div");
      card.className="plan-card"+(plan.completed?" completed":"");
      card.innerHTML=`<h3>${plan.course_title}</h3>
      <p><strong>Plan:</strong> ${plan.title}</p>
      <p><strong>Date:</strong> ${plan.date}</p>
      <p><strong>Status:</strong> ${plan.completed?"Completed":"Pending"}</p>
      <button class="toggleCompleteBtn">${plan.completed?"Mark Incomplete":"Mark Complete"}</button>
      <button class="deleteBtn">Delete</button>`;
      plansContainer.appendChild(card);

      // Toggle complete
      card.querySelector(".toggleCompleteBtn").addEventListener("click", async ()=>{
        plan.completed = !plan.completed;
        renderPlans();
      });

      // Delete
      card.querySelector(".deleteBtn").addEventListener("click", async ()=>{
        try{
          const token=getToken();
          const res = await fetch(`/plans/${plan.id}/`,{
            method:"DELETE",
            headers:{Authorization:`Bearer ${token}`}
          });
          if(res.ok){ plans.splice(index,1); renderPlans(); }
        }catch(err){ console.error(err);}
      });
    });
  };

  renderPlans();

  // Add new plan
  addPlanForm.addEventListener("submit", async e=>{
    e.preventDefault();
    const courseTitle=document.getElementById("courseTitle").value.trim();
    const planTitle=document.getElementById("planTitle").value.trim();
    const planDate=document.getElementById("planDate").value;
    if(!courseTitle||!planTitle||!planDate){ addMessage.textContent="All fields required"; return; }

    const newPlan={course_title:courseTitle,title:planTitle,date:planDate,completed:false};
    plans.push(newPlan);
    renderPlans();
    addPlanForm.reset();
    addMessage.textContent="Plan added!";
    setTimeout(()=>addMessage.textContent="",3000);

    // Send to backend
    try{
      const token=getToken();
      const res=await fetch("/plans/",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
        body:JSON.stringify(newPlan)
      });
      const data=await res.json();
      if(res.ok){ newPlan.id=data.id; }
      else showMessage("Failed to add backend: "+JSON.stringify(data),true,"addMessage");
    }catch(err){ showMessage("Error connecting to backend",true,"addMessage"); console.error(err);}
  });
});

// -------- Logout --------
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("authToken");  // remove JWT token
      window.location.href = "/";             // redirect to login page
    });
  }
});