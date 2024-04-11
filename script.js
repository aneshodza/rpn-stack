import kellerautomat from "./kellerautomat.js";

let form = document.querySelector("form");

let stack = [];
let currentSpot = 0;

let word = "";

let delay = 0;

form.addEventListener("submit", async function(e) {
  e.preventDefault();
  let calculation = e.target.elements["rpn-input"].value;
  delay = e.target.elements["rpn-delay"].value;

  let splitCalculation = calculation.split(" ");
  let compactCalculation = splitCalculation.join("");
  let convertedCalculation = compactCalculation.replace(/[*+]/g, "O").replace(
    /\d/g,
    "Z",
  );
  calculation = splitCalculation;
  word = convertedCalculation;
  drawCalculation(splitCalculation);
  drawWord();

  kellerautomat.clear();
  kellerautomat.delay = delay;
  kellerautomat.inputWord = convertedCalculation;
  if (!await kellerautomat.run()) {
    window.alert("Word not accepted");
    return;
  }

  setTimeout(() => {
    calculate(splitCalculation, delay);
  }, delay * 5);
});

function calculate(calculation, delay) {
  currentSpot = 0;
  stack = [];
  calculation.forEach((element, index) => {
    setTimeout(() => {
      if (/[0-9]/.test(element)) {
        stack.push(parseInt(element));
      } else {
        performOperation(element);
      }
      currentSpot++;
      drawCalculation(calculation);
      drawStack();
      if (index === calculation.length - 1) {
        setTimeout(drawStack, delay); // Draw stack after all calculations with delay
      }
    }, delay * index);
  });
  drawStack();
}

function performOperation(operation) {
  if (operation === "+") {
    let num1 = stack.pop();
    let num2 = stack.pop();
    stack.push(num1 + num2);
  } else if (operation === "*") {
    let num1 = stack.pop();
    let num2 = stack.pop();
    stack.push(num1 * num2);
  }
}

const drawStack = () => {
  let stackElement = document.querySelector(".stack");
  stackElement.innerHTML = "";
  if (stack.length === 0) {
    let emptyStack = document.createElement("div");
    emptyStack.textContent = "none";
    stackElement.appendChild(emptyStack);
    return;
  }
  [...stack].reverse().forEach((element) => {
    let stackItem = document.createElement("div");
    stackItem.textContent = element;
    stackElement.appendChild(stackItem);
  });
};

const drawCalculation = (calculation) => {
  let calculationElement = document.querySelector(".calculation");
  calculationElement.innerHTML = "";
  calculation.forEach((element, idx) => {
    let calculationItem = document.createElement("div");
    if (idx === currentSpot - 1) {
      calculationItem.classList.add("current");
    }
    calculationItem.textContent = element;
    calculationElement.appendChild(calculationItem);
  });
};

const drawWord = () => {
  let wordElement = document.querySelector(".word");
  wordElement.innerHTML = "";
  word.split("").forEach((element, idx) => {
    let wordItem = document.createElement("div");
    wordItem.textContent = element;
    wordElement.appendChild(wordItem);
  });
};
