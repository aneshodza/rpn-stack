var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log("JS loaded!");
let nodeNameElement = document.getElementById("node-name");
let stackElement = document.getElementsByClassName("stack")[0];
function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
class Kellerautomat {
    constructor(inputWord = "", delay = 0) {
        this.zustaende = [];
        this.stack = new Stack();
        this.startZustand = null;
        this.endZustaende = [];
        this.currentZustand = null;
        this.inputWord = "";
        this.delay = 0;
        this.runs = 0;
        this.inputWord = inputWord;
        this.delay = delay;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.inputWord.length > 0) {
                let success = this.step();
                yield sleep(this.delay);
                if (!success) {
                    console.error("Went to trash state");
                    return false;
                }
                // @ts-ignore
                window.currentWordSpot = this.inputWord;
            }
            console.info("Terminated");
            if (this.endZustaende.includes(this.currentZustand)) {
                console.info("Word accepted");
                return true;
            }
            return false;
        });
    }
    step() {
        this.runs++;
        let currentToken = this.inputWord.charAt(0);
        this.inputWord = this.inputWord.slice(1);
        // Find the transition function that matches the current token
        let transitionFunction = this.currentZustand.findUebergangsfunktion(currentToken, this.stack.last());
        // Check if a transition function was found and then proceed with the state transition
        if (transitionFunction === undefined) {
            console.log("No transition found!");
            return false;
        }
        transitionFunction.uebergang(this.stack, currentToken);
        this.currentZustand = transitionFunction.nextZustand;
        kellerautomat.snapshot();
        while (true) {
            let episilonTransitionFunction = this.currentZustand
                .findEpisilonUebergangsfunktion(this.stack.last());
            if (episilonTransitionFunction === undefined)
                break;
            episilonTransitionFunction.uebergang(this.stack, "");
            this.currentZustand = episilonTransitionFunction.nextZustand;
            kellerautomat.snapshot();
        }
        return true;
    }
    clear() {
        this.stack = new Stack();
        this.currentZustand = this.startZustand;
        this.runs = 0;
        this.inputWord = "";
        this.snapshot();
    }
    addZustand(zustand) {
        this.zustaende.push(zustand);
    }
    setStartZustand(zustand) {
        this.startZustand = zustand;
        this.currentZustand = this.startZustand;
    }
    addEndZustand(zustand) {
        this.endZustaende.push(zustand);
    }
    logState() {
        console.log("All nodes: ", this.zustaende);
        console.log("Start node: ", this.startZustand);
        console.log("End nodes: ", this.endZustaende);
        console.log("Current node: ", this.currentZustand);
        console.log("Stack: ", this.stack);
    }
    snapshot() {
        var _a, _b;
        nodeNameElement.innerHTML = (_a = this.currentZustand) === null || _a === void 0 ? void 0 : _a.name;
        stackElement.innerHTML = this.stack.stackClone().reverse().join(" ");
        stackElement.innerHTML = "";
        if (this.stack.stackClone().length === 0) {
            let emptyStack = document.createElement("div");
            emptyStack.textContent = "none";
            stackElement.appendChild(emptyStack);
            return;
        }
        this.stack.stackClone().reverse().forEach((element) => {
            let stackItem = document.createElement("div");
            stackItem.textContent = element;
            stackElement.appendChild(stackItem);
        });
        let element = document.getElementById(`word-item-${this.runs - 1}`);
        if (element !== null)
            element.classList.add("current");
        console.log(`Snapshot: \n` +
            `Current node: ${(_b = this.currentZustand) === null || _b === void 0 ? void 0 : _b.name} \n\n` +
            `Stack: \n` +
            `${this.stack.stackClone().reverse().join("\n")}\n\n` +
            `Ugly stack [${this.stack.stackClone().reverse().join(", ")}]`);
    }
}
class Zustand {
    constructor(name) {
        this.name = null;
        this.uebergangsfunktionen = [];
        this.name = name;
        this.uebergangsfunktionen = [];
    }
    addUebergangsfunktion(uebergangsfunktion) {
        this.uebergangsfunktionen.push(uebergangsfunktion);
    }
    findUebergangsfunktion(eingabe, stackPop) {
        return this.uebergangsfunktionen.find((uebergangsfunktion) => {
            return uebergangsfunktion.checkIfUebergang(eingabe, stackPop);
        });
    }
    findEpisilonUebergangsfunktion(stackPop) {
        return this.findUebergangsfunktion("", stackPop);
    }
}
class Stack {
    constructor() {
        this.stackValues = [];
        this.stackValues = ["$"];
    }
    checkForValue(value) {
        return this.last() === value;
    }
    pop() {
        return this.stackValues.pop();
    }
    push(value) {
        this.stackValues.push(value);
    }
    last() {
        return this.stackValues[this.stackValues.length - 1];
    }
    stackClone() {
        return [...this.stackValues];
    }
}
class Uebergangsfunktion {
    constructor(eingabe, nextZustand, stackPop, stackPush) {
        this.eingabe = null;
        this.nextZustand = null;
        this.stackPop = null;
        this.stackPush = null;
        this.eingabe = eingabe;
        this.nextZustand = nextZustand;
        this.stackPop = stackPop;
        this.stackPush = stackPush;
    }
    uebergang(stack, currentToken) {
        if (currentToken !== this.eingabe) {
            return null;
        }
        if (!stack.checkForValue(this.stackPop)) {
            return null;
        }
        stack.pop();
        this.stackPush.reverse().forEach((value) => {
            stack.push(value);
        });
        return this.nextZustand;
    }
    checkIfUebergang(eingabe, stackPop) {
        return (this.eingabe === eingabe && this.stackPop === stackPop);
    }
}
// Define Kellerautomat
let kellerautomat = new Kellerautomat();
// Define Zustände
let q0 = new Zustand("q0");
let q1 = new Zustand("q1");
let q2 = new Zustand("q2");
let q3 = new Zustand("q3");
let q4 = new Zustand("q4");
// Add Zustände to Kellerautomat
kellerautomat.addZustand(q0);
kellerautomat.addZustand(q1);
kellerautomat.addZustand(q2);
kellerautomat.addZustand(q3);
kellerautomat.addZustand(q4);
// Set Startzustand
kellerautomat.setStartZustand(q0);
// Set Endzustände
kellerautomat.addEndZustand(q1);
// Define Uebergangsfunktionen
let uebergangsfunktion1 = new Uebergangsfunktion("Z", q1, "$", ["1", "$"]);
q0.addUebergangsfunktion(uebergangsfunktion1);
let uebergangsfunktion2 = new Uebergangsfunktion("Z", q2, "1", ["1", "1"]);
q1.addUebergangsfunktion(uebergangsfunktion2);
let uebergangsfunktion3 = new Uebergangsfunktion("Z", q2, "1", ["1", "1"]);
q2.addUebergangsfunktion(uebergangsfunktion3);
let uebergangsfunktion4 = new Uebergangsfunktion("O", q3, "1", []);
q2.addUebergangsfunktion(uebergangsfunktion4);
let uebergangsfunktion5 = new Uebergangsfunktion("", q4, "1", []);
q3.addUebergangsfunktion(uebergangsfunktion5);
let uebergangsfunktion6 = new Uebergangsfunktion("", q2, "1", ["1", "1"]);
q4.addUebergangsfunktion(uebergangsfunktion6);
let uebergangsfunktion7 = new Uebergangsfunktion("", q1, "$", ["1", "$"]);
q4.addUebergangsfunktion(uebergangsfunktion7);
kellerautomat.snapshot();
export default kellerautomat;
