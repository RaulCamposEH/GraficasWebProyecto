const return_button = document.getElementById("rtn-btn")

const handle_return_btn = () => {
  history.back()
}

return_button.addEventListener("click", handle_return_btn)