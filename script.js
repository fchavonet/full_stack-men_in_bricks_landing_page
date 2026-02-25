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
* COUNTERS ANIMATION BEHAVIOR *
******************************/

const counters = document.querySelectorAll("[data-counter]");

const animate = (element) => {
  const target = Number(element.getAttribute("data-counter")) || 0;
  const duration = Number(element.getAttribute("data-duration")) || 2000;

  const start = 0;
  const startTime = performance.now();

  const tick = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(start + (target - start) * progress);
    element.textContent = String(value);

    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((element) => {
      if (!element.isIntersecting) return;
      if (element.target.dataset.counterDone === "true") return;
      element.target.dataset.counterDone = "true";
      animate(element.target);
    });
  },
  { threshold: 0.5 }
);

counters.forEach((element) => observer.observe(element));


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
