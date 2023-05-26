const return_button = document.getElementById("rtn-btn")

const handle_return_btn = () => {
  window.location.href = "index.html"
}

return_button.addEventListener("click", handle_return_btn)