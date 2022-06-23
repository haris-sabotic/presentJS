function getAllChildren(element) {
  var children = [].slice.call(element.children),
    found = 0;
  while (children.length > found) {
    children = children.concat([].slice.call(children[found].children));
    found++;
  }
  return children;
}

let slides = document.getElementsByClassName("slide");

// create div containing a slide, whenever the user transitions to a slide, the contents of this div change
let canvas = document.createElement("div");
canvas.innerHTML = slides[0].innerHTML;
canvas.id = slides[0].id;
canvas.className = "slide";
document.body.appendChild(canvas);

// hide all slide divs in the html - they only serve as a template, they're all hidden on start and get put into the canvas div
for (let i = 0; i < slides.length; i++) {
  // hide all slides except the last one(that's the canvas)
  if (i !== slides.length - 1) slides[i].style.display = "none";
  // also hide all sections on start
  let children = getAllChildren(slides[i]);
  for (let j = 0; j < children.length; j++) {
    if (children[j].className === "section") {
      children[j].style.visibility = "hidden";
    }
  }
}

// progress bar on the bottom of the screen - looks very epic
// just add <div id="progress-bar"></div> to your html to use it
let progress_bar = document.getElementById("progress-bar");
if (progress_bar != undefined) {
  progress_bar.style = `
  height: 5px;
  background-color: lightblue;

  position: fixed;
  bottom: 0;
  width: ${100 / (slides.length - 1)}%;

  transition: ease 0.3s;
`;
}

let current_slide = 0;
document.addEventListener(
  "keydown",
  (event) => {
    function update() {
      // put current slide into the canvas
      canvas.innerHTML = slides[current_slide].innerHTML;
      // set the id to be the same for easier use of css on the entire slide
      canvas.id = slides[current_slide].id;

      // calculate progress bar width
      if (progress_bar != undefined) {
        progress_bar.style.width = `${
          (100 / (slides.length - 1)) * (current_slide + 1)
        }%`;
      }
    }

    // go to next slide on right arrow or space pressed
    if (
      (event.key == "ArrowRight" || event.key == " ") &&
      current_slide < slides.length - 2
    ) {
      // get number of sections that need to be revealed before switching to the next slide
      let sections_left = 0;
      let children = getAllChildren(slides[current_slide]);
      for (let i = 0; i < children.length; i++) {
        if (
          children[i].className === "section" &&
          children[i].style.visibility === "hidden"
        ) {
          sections_left++;
        }
      }

      // reveal next hidden section
      for (let i = 0; i < children.length; i++) {
        if (children[i].className === "section") {
          if (children[i].style.visibility === "hidden") {
            children[i].style.visibility = "visible";
            break;
          }
        }
      }

      // if there's no sections left switch to the next slide
      if (sections_left === 0) {
        current_slide += 1;
      }
      update();

      let keyFrames = [
        {
          opacity: 0,
          filter: "blur(2px)",
        },
        {
          opacity: 1,
          filter: "blur(0)",
        },
      ];
      let options = {
        duration: 1000,
        easing: "ease",
        fill: "forwards",
      };
      // animate transitions if body has the transition-anim class
      if (document.body.className == "transition-anim") {
        let canvasChildren = getAllChildren(canvas);
        for (let i = 0; i < canvasChildren.length; i++) {
          if (sections_left > 0) {
            for (let j = canvasChildren.length - 1; j >= 0; j--) {
              if (
                canvasChildren[j].className === "section" &&
                canvasChildren[j].style.visibility === "visible"
              ) {
                canvasChildren[j].animate(keyFrames, options);
                break;
              }
            }
          } else {
            canvasChildren[i].animate(keyFrames, options);
          }
        }
      }
    }

    // go to prev slide on left arrow pressed
    if (event.key == "ArrowLeft" && current_slide > 0) {
      // get number of sections that need to be hidden before switching to the previous slide
      let sections_left = 0;
      let children = getAllChildren(slides[current_slide]);
      for (let i = children.length - 1; i > 0; i--) {
        if (children[i].className === "section") {
          if (children[i].style.visibility === "visible") {
            sections_left++;
          }
        }
      }

      // hide next visible section
      for (let i = children.length - 1; i > 0; i--) {
        if (children[i].className === "section") {
          if (children[i].style.visibility === "visible") {
            children[i].style.visibility = "hidden";
            break;
          }
        }
      }

      // if there's no sections left switch to the previous slide
      if (sections_left === 0) {
        current_slide -= 1;
      }
      update();
    }
  },
  false
);
