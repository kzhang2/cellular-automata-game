import { printStrategy } from "./utils.mjs";

// restructure to put this stuff in sketch.js?

let start = (async () => {
    hide_elements();
    // start_button.style.display = "none";
    const { default: sketch_creator } = await import("./sketch.mjs");
    // console.log(sketch);
    new window.p5(sketch_creator(strategy));
});

let space_div = document.getElementById("space");
let strategy_select = document.getElementById("strategy-select");

function hide_elements() {
    for (let i = 0; i < strategy_select.children.length; i++) {
        strategy_select.children[i].style.display = "none";
    }
    space_div.style.height = "0%";
    strategy_select.style.height = "0%";
}

function add_line_break(element) {
    let br = document.createElement("div")
    br.classList.add("break");
    element.appendChild(br);
}
function strategy_event_handler(strat_str, strat_ind, display) {
    return () => {
        strategy.push(strat_ind);
        strategy_string = printStrategy(strategy);
        display.innerHTML = `${strategy_string} ${strategy}`
    };
}

let strategy_string = "";
let strategy = [];
let moves_str = ["advance", "rotate left", "rotate right", "clone", "eat"];

export function add_handling() {
    space_div.style.height = "20%";
    strategy_select.style.height = "0%";
    while(strategy.length > 0) {
        console.log("asdf");
        strategy.pop();
    }
    let strategy_display = document.createElement("p");
    for(let i = 0; i < moves_str.length; i++) {
        let new_button = document.createElement("button");
        let handler = strategy_event_handler(moves_str[i], i, strategy_display);
        new_button.addEventListener("click", handler);
        new_button.innerHTML = moves_str[i];
        strategy_select.appendChild(new_button);
    }
    add_line_break(strategy_select);
    strategy_select.appendChild(strategy_display);
    
    let remove_button = document.createElement("button");
    remove_button.innerHTML = "Remove last move";
    remove_button.addEventListener("click", () => {
        strategy.pop();
        strategy_string = printStrategy(strategy);
        strategy_display.innerHTML = `${strategy_string} ${strategy}`;
    });
    add_line_break(strategy_select);
    strategy_select.appendChild(remove_button);
    
    let start_button = document.createElement("button");
    start_button.innerHTML = "Start";
    start_button.addEventListener("click", start);
    strategy_select.appendChild(start_button);
}

add_handling();



// start();