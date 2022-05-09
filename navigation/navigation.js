function changeNavigation(clickedElement) {
  const links = document.getElementsByClassName("navigation-link");
  for (const link of links) {
    link.classList.remove("navigation-active");
  }
  clickedElement.classList.add("navigation-active");
}

function toggleMenu() {
  const navContainer = document.getElementById("navigation-link-container");
  if (navContainer.style.display == "") {
    navContainer.style.display = "flex";
  } else {
    navContainer.style = "";
  }
}
