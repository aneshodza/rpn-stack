let form = document.querySelector("form");

let stack = [];
let currentSpot = 0;

form.addEventListener("submit", function(e) {
  e.preventDefault();
  let calculation = e.target.elements["rpn-input"].value;
  let delay = e.target.elements["rpn-delay"].value;
  console.log(e.target.elements);
  console.log(delay);

  let splitCalculation = calculation.split(" ");
  drawCalculation(splitCalculation);

  calculate(splitCalculation, delay);
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

drawStack();

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
