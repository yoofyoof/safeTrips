// login page show message
// show message
function loginShowMsg(msg) {
  const divMsg = document.querySelector("#login-msg");
  divMsg.style.display = "block";
  divMsg.innerHTML = msg;
}

// log in form
let loginForm = document.querySelector(".login-form");
loginForm.addEventListener("submit", onFormLoginSubmit);

async function onFormLoginSubmit(evt) {
  evt.preventDefault();

  const formData = new FormData(loginForm);
  const data = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const response = await fetch("/login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const res = await response.json();
  if (res.login === "ok") {
    window.location.href = "index.html";
  } else {
    loginShowMsg(res.loginError);
  }
}
