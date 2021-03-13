// register page show message
// show message
function registerShowMsg(msg) {
  const divMsg = document.querySelector("#register-msg");
  divMsg.style.display = "block";
  divMsg.innerHTML = msg;
}

// register form
let registerForm = document.querySelector(".register-form");
registerForm.addEventListener("submit", onFormRegisterSubmit);

async function onFormRegisterSubmit(evt) {
  evt.preventDefault();

  const formData = new FormData(registerForm);
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const response = await fetch("/register", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const res = await response.json();
  if (res.register === "ok") {
    window.location.href = "login.html";
  } else {
    registerShowMsg(res.registerError);
  }
}
