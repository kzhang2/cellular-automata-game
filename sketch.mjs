//add sensing, food constraints?
import { createRandomStrategy, printStrategy } from "./utils.mjs";
import { Grid } from "./classes.mjs";
import { add_handling } from "./index.mjs";

var scores = {};
var num_strategies = 5;
var stratLen = 8;
let moves_str = ["advance", "rotate left", "rotate right", "clone", "eat"];

export default function sketch_creator(my_strat) {

	return (p) => {
		let width = 720;
		let height = 400;
		let w = 20;
		let columns = Math.floor(width / w);
		let rows = Math.floor(height / w);
		// columns, rows, satiety, lifespan, decay
		let num_food_sources = 5;
		let food_radius = 5
		let max_food_rate = 10
		let satiety = 100;
		let lifespan = 100;
		let decay = 3;
		let grid = new Grid(columns, rows, satiety, lifespan, decay, num_food_sources, food_radius, max_food_rate);

		let frame_rate = 60;
		let container = document.getElementById("sketch-holder");
		let frame_count = document.createElement("p");

		p.setup = () => {
			// test();
			grid = new Grid(columns, rows, satiety, lifespan, decay, num_food_sources, food_radius, max_food_rate);
			let canvas = p.createCanvas(width, height);
			canvas.parent('sketch-holder');
			p.frameRate(frame_rate);
			
			grid.initialize_strategy(my_strat, "My Strategy:");

			// testing movement
			let test_strat = [];
			let test_strat2 = [0, 0, 1];
			// grid.initialize_strategy_loc(test_strat, 8, 8);
			// grid.initialize_strategy_loc(test_strat2, 10, 10);

			// testing cloning
			let test_strat3 = [3, 1, 0];
			// grid.initialize_food_source_loc(20, 10);
			// grid.initialize_strategy_loc(test_strat3, 20, 10);
			// grid.initialize_strategy_loc(test_strat2, 20, 8);	

			//testing eating
			let test_strat4 = [4, 0];
			// grid.initialize_strategy_loc(test_strat4, 10, 12);
			// grid.initialize_strategy_loc(test_strat, 10, 8);

			// let strat5 = [1, 4, 4, 3, 0, 0, 1, 3];
			let strat6 = [0,3,2,4,3,0,1,0];
			// grid.initialize_strategy(strat5);
			grid.initialize_strategy(strat6);

			// random strats
			for (let i = 0; i < num_strategies; i++) {
				let curr_strat = createRandomStrategy(stratLen);
				grid.initialize_strategy(curr_strat);
			}

			// let battle_strat = [3, 0, 2, 4];

			// make add break function?
			for (let prop in grid.cell_data) {
				let curr_strat = grid.cell_data[prop].strategy;
				let strat_str = printStrategy(curr_strat);
				let br = document.createElement("br");
				let strat_p = document.createElement("p");
				let color_box = document.createElement("div")
				color_box.className = "box";
				color_box.style.backgroundColor = prop;
				container.appendChild(br);
				if (grid.cell_data[prop].label != "") {
					let label_p = document.createElement("p");
					label_p.innerHTML = grid.cell_data[prop].label;
					label_p.style.paddingRight = "10px";
					container.appendChild(label_p);
				}
				container.appendChild(color_box);
				container.appendChild(strat_p);
				strat_p.innerHTML = `${prop}: ${strat_str} \n [${curr_strat}]`;
			}

			let br = document.createElement("br");
			container.appendChild(br);
			container.appendChild(frame_count);

			let reset_button = document.createElement("button");
			reset_button.innerHTML = "Make new strategy";
			reset_button.addEventListener("click", () => {
				reset_state(p, container);
				add_handling();
			});
			br = document.createElement("br");
			container.appendChild(br);
			container.appendChild(reset_button);
		};
		p.draw = () => {
			p.background(255);
			grid.simulate();
			// score();
			// if (p.frameCount % 30) {
			// 	console.log(scores);
			// }
			for (var i = 0; i < grid.columns; i++) {
				for (var j = 0; j < grid.rows; j++) {
					// make draw grid cell function?
					let curr_grid_cell = grid.states[i][j];
					p.stroke(0);
					p.strokeWeight(0);

					// render food visual
					p.fill(curr_grid_cell.food);
					p.rect(i * w, j * w, w, w);

					// render trail
					if (curr_grid_cell.color != "#FFFFFF") {
						p.fill(curr_grid_cell.color);
						p.ellipse(i * w + (w - 1) / 2, j * w + (w - 1) / 2, (w - 1) / 1.5, (w - 1) / 1.5);
					}

					// render cell
					if (curr_grid_cell.occupied) {
						p.fill("#FCFCFC")
						p.stroke("#FCFCFC");
						p.circle(i * w + (w - 1) / 2, j * w + (w - 1) / 2, (w - 1) / 2);
					}
				}
			}
			frame_count.innerHTML = `frame count: ${p.frameCount}`;
		};
		p.mousePressed = () => {
			// delete old dashboard?
			// p.remove();
			if (p.mouseX >= 0 && p.mouseX < width && p.mouseY >= 0 && p.mouseY < height) {
				while (container.childNodes.length > 1) {
					container.removeChild(container.lastChild);
				}
				p.frameCount = 0;
				p.setup();
			}
		};
	};
}

function reset_state(p, container) {
	p.remove();
	while (container.childNodes.length > 0) {
		container.removeChild(container.lastChild);
	}
}


// replace with method in grid class
function score() {
	var newScores = {};
	for (var i = 0; i < columns; i++) {
		for (var j = 0; j < rows; j++) {
			var currCell = board[i][j];
			if (currCell[0] != 255) {
				if (!(currCell[0] in newScores)) {
					newScores[currCell[0]] = 1;
				} else {
					newScores[currCell[0]] += 1;
				}
			}
		}
	}
	scores = newScores
}


