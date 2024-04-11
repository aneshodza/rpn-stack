console.log("JS loaded!");

function sleep(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

class Kellerautomat {
  zustaende: Array<Zustand> | null = [];
  stack: Stack = new Stack();
  startZustand: Zustand | null = null;
  endZustaende: Array<Zustand> = [];

  currentZustand: Zustand | null = null;
  inputWord: string = "";

  delay: number = 0;

  constructor(inputWord: string = "", delay: number = 0) {
    this.inputWord = inputWord;
    this.delay = delay;
  }

  async run(): Promise<boolean> {
    while (this.inputWord.length > 0) {
      let success = this.step();

      await sleep(this.delay);
      if (!success) {
        console.error("Went to trash state");
        return false;
      }
      // @ts-ignore
      window.currentWordSpot = this.inputWord;
    }
    console.info("Terminated");

    if (this.endZustaende.includes(this.currentZustand!)) {
      console.info("Word accepted");
      return true;
    }
    return false;
  }

  step(): boolean {
    let currentToken = this.inputWord.charAt(0);
    this.inputWord = this.inputWord.slice(1);

    // Find the transition function that matches the current token
    let transitionFunction = this.currentZustand!.findUebergangsfunktion(
      currentToken,
      this.stack.last(),
    );

    // Check if a transition function was found and then proceed with the state transition
    if (transitionFunction === undefined) {
      console.log("No transition found!");
      return false;
    }

    transitionFunction.uebergang(this.stack, currentToken);
    this.currentZustand = transitionFunction.nextZustand;
    kellerautomat.snapshot();

    while (true) {
      let episilonTransitionFunction = this.currentZustand!
        .findEpisilonUebergangsfunktion(
          this.stack.last(),
        );
      if (episilonTransitionFunction === undefined) break;
      episilonTransitionFunction.uebergang(this.stack, "");
      this.currentZustand = episilonTransitionFunction.nextZustand;
      kellerautomat.snapshot();
    }

    return true;
  }

  addZustand(zustand: Zustand) {
    this.zustaende!.push(zustand);
  }

  setStartZustand(zustand: Zustand) {
    this.startZustand = zustand;
    this.currentZustand = this.startZustand;
  }

  addEndZustand(zustand: Zustand) {
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
    console.log(
      `Snapshot: \n` +
      `Current node: ${this.currentZustand?.name} \n\n` +
      `Stack: \n` +
      `${this.stack.stackClone().reverse().join("\n")}\n\n` +
      `Ugly stack [${this.stack.stackClone().reverse().join(", ")}]`,
    );
  }
}

class Zustand {
  name: string | null = null;
  uebergangsfunktionen: Array<Uebergangsfunktion> = [];

  constructor(name: string) {
    this.name = name;
    this.uebergangsfunktionen = [];
  }

  addUebergangsfunktion(uebergangsfunktion: Uebergangsfunktion) {
    this.uebergangsfunktionen.push(uebergangsfunktion);
  }

  findUebergangsfunktion(eingabe: string, stackPop: string) {
    return this.uebergangsfunktionen.find((uebergangsfunktion) => {
      return uebergangsfunktion.checkIfUebergang(eingabe, stackPop);
    });
  }

  findEpisilonUebergangsfunktion(stackPop: string) {
    return this.findUebergangsfunktion("", stackPop);
  }
}

class Stack {
  stackValues: Array<string> = [];

  constructor() {
    this.stackValues = ["$"];
  }

  checkForValue(value: string) {
    return this.last() === value;
  }

  pop() {
    return this.stackValues.pop();
  }

  push(value: string) {
    this.stackValues.push(value);
  }

  last(): string {
    return this.stackValues[this.stackValues.length - 1];
  }

  stackClone(): Array<string> {
    return [...this.stackValues];
  }
}

class Uebergangsfunktion {
  eingabe: string | null = null;
  nextZustand: Zustand | null = null;
  stackPop: string | null = null;
  stackPush: Array<string> | null = null;

  constructor(
    eingabe: string,
    nextZustand: Zustand,
    stackPop: string,
    stackPush: Array<string>,
  ) {
    this.eingabe = eingabe;
    this.nextZustand = nextZustand;
    this.stackPop = stackPop;
    this.stackPush = stackPush;
  }

  uebergang(stack: Stack, currentToken: string): Zustand | null {
    if (currentToken !== this.eingabe) {
      return null;
    }

    if (!stack.checkForValue(this.stackPop!)) {
      return null;
    }

    stack.pop();
    this.stackPush!.reverse().forEach((value) => {
      stack.push(value);
    });
    return this.nextZustand;
  }

  checkIfUebergang(eingabe: string, stackPop: string) {
    return (
      this.eingabe === eingabe && this.stackPop === stackPop
    );
  }
}

// Define Kellerautomat
let kellerautomat: Kellerautomat = new Kellerautomat();

// Define Zustände
let q0: Zustand = new Zustand("q0");
let q1: Zustand = new Zustand("q1");
let q2: Zustand = new Zustand("q2");
let q3: Zustand = new Zustand("q3");
let q4: Zustand = new Zustand("q4");

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
let uebergangsfunktion1: Uebergangsfunktion = new Uebergangsfunktion(
  "Z",
  q1,
  "$",
  ["1", "$"],
);
q0.addUebergangsfunktion(uebergangsfunktion1);

let uebergangsfunktion2: Uebergangsfunktion = new Uebergangsfunktion(
  "Z",
  q2,
  "1",
  ["1", "1"],
);
q1.addUebergangsfunktion(uebergangsfunktion2);

let uebergangsfunktion3: Uebergangsfunktion = new Uebergangsfunktion(
  "Z",
  q2,
  "1",
  ["1", "1"],
);
q2.addUebergangsfunktion(uebergangsfunktion3);
let uebergangsfunktion4: Uebergangsfunktion = new Uebergangsfunktion(
  "O",
  q3,
  "1",
  [],
);
q2.addUebergangsfunktion(uebergangsfunktion4);

let uebergangsfunktion5: Uebergangsfunktion = new Uebergangsfunktion(
  "",
  q4,
  "1",
  [],
);
q3.addUebergangsfunktion(uebergangsfunktion5);

let uebergangsfunktion6: Uebergangsfunktion = new Uebergangsfunktion(
  "",
  q2,
  "1",
  ["1", "1"],
);
q4.addUebergangsfunktion(uebergangsfunktion6);
let uebergangsfunktion7: Uebergangsfunktion = new Uebergangsfunktion(
  "",
  q1,
  "$",
  ["1", "$"],
);
q4.addUebergangsfunktion(uebergangsfunktion7);

export default kellerautomat;
