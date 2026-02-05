/**********************
* NAVIGATION BEHAVIOR *
**********************/

const navLinks = document.querySelectorAll("a[data-target]");

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const id = link.getAttribute("data-target");
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({ block: "start" });
    }
  })
});


/******************************
* MOVE TO TOP BUTTON BEHAVIOR *
******************************/

const moveToTop = document.querySelectorAll(".move-to-top");

moveToTop.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();

    window.scrollTo({ top: 0 });
  });
});


/**************************
* COPYRIGHT YEAR BEHAVIOR *
**************************/

const copyrightYear = document.getElementById("copyright-year");
if (copyrightYear) {
  copyrightYear.textContent = String(new Date().getFullYear());
}
