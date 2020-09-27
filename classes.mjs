import { random_color  } from "./utils.mjs";

export class Cell {
    constructor(color, strategy, satiety = 100, lifespan = 100, direction = [0, -1], clock = 0, 
                digesting=false, consumption_rate=2, growth_rate = 20, max_satiety=200) {
        this.color = color;
        this.strategy = strategy;
        this.satiety = satiety;
        this.lifespan = lifespan;
        this.direction = direction;
        this.clock = clock;
        this.digesting = digesting;
        this.consumption_rate = consumption_rate;
        this.max_satiety = max_satiety;
        this.growth_rate = growth_rate;
    }

    rot_left() {
        let dir = this.direction;
        // up
        if (dir[0] == 0 && dir[1] == -1) {
            // left
            dir[0] = -1;
            dir[1] = 0;
        } else if (dir[0] == -1 && dir[1] == 0) {
            dir[0] = 0;
            dir[1] = 1;
        } else if (dir[0] == 0 && dir[1] == 1) {
            dir[0] = 1;
            dir[1] = 0;
        } else if (dir[0] == 1 && dir[1] == 0) {
            dir[0] = 0;
            dir[1] = -1;
        }
    }

    rot_right() {
        let dir = this.direction;
        if (dir[0] == 0 && dir[1] == -1) {
            dir[0] = 1;
            dir[1] = 0;
        } else if (dir[0] == 1 && dir[1] == 0) {
            dir[0] = 0;
            dir[1] = 1;
        } else if (dir[0] == 0 && dir[1] == 1) {
            dir[0] = -1;
            dir[1] = 0;
        } else if (dir[0] == -1 && dir[1] == 0) {
            dir[0] = 0;
            dir[1] = -1;
        }
    }

    // returns food eaten
    eat_food(food) {
        if (this.consumption_rate <= food) {
            let growth = this.growth_rate - Math.max(0, this.growth_rate + (this.satiety - this.max_satiety));
            if (this.consumption_rate + growth <= food) {
                this.satiety += growth;
                return -1 * (growth + this.consumption_rate);
            } else {
                let actual_growth = food - (this.consumption_rate + growth);
                this.satiety += actual_growth;
                return -1 * (actual_growth + this.consumption_rate);
            }
        } else {
            let satiety_decrease = this.consumption_rate - food;
            this.satiety -= satiety_decrease;
            this.satiety = Math.max(this.satiety, 0);
            return -1 * food;
        }
    }
}

function copy_cell(cell) {
    return new Cell(cell.color, cell.strategy, cell.satiety, cell.lifespan, 
                    cell.direction, cell.clock, cell.digesting, cell.consumption_rate, cell.growth_rate, cell.max_satiety);
}

// also contains a cell property that can be added later
export class GridState {
    constructor(color = "#FFFFFF", occupied = false, cell = null, food = 100, food_rate = 1, max_food=255) {
        this.color = color;
        this.occupied = occupied;
        this.cell = cell;
        this.food_rate = food_rate;
        this.food=food;
        this.max_food = max_food;
    }

    accept_cell(cell) {
        this.cell = cell;
        this.occupied = true;
        this.color = cell.color;
    }

    remove_cell() {
        this.occupied = false;
    }

    process_food() {
        let food_grown = this.food_rate - Math.max(0, this.food_rate + (this.food - this.max_food)); 
        this.food += food_grown;
        if (this.occupied) {
            let food_eaten = this.cell.eat_food(this.food);
            this.food += food_eaten;
        }
    }
}

function copy_state(state) {
    return new GridState(state.color, state.occupied, state.cell, state.food, state.food_rate, state.max_food);
}

export class Grid {
    constructor(columns, rows, satiety=5, lifespan=100, decay=3, num_food_sources=10, food_radius=10, max_food_rate=10) {
        this.columns = columns;
        this.rows = rows;
        this.states = this.new_board();
        this.cell_data = {}
        this.satiety = satiety;
        this.lifespan = lifespan;
        this.decay = decay;
        this.num_food_sources = num_food_sources;
        this.food_radius = food_radius;
        this.max_food_rate = max_food_rate;

        for (let i = 0; i < num_food_sources; i++) {
            this.initialize_food_source();
        }
    }
    new_board() {
        let board = new Array(this.columns);
        for (let i = 0; i < this.columns; i++) {
            board[i] = new Array(this.rows);
            for (let j = 0; j < this.rows; j++) {
                board[i][j] = new GridState();
            }
        }
        return board;
    }

    initialize_food_source() {
        let ran_x = Math.floor((this.columns / 2) * Math.random() + this.columns / 4);
        let ran_y = Math.floor((this.rows / 2) * Math.random() + this.rows / 4);

        this.initialize_food_source_loc(ran_x, ran_y);
    }

    initialize_food_source_loc(x, y) {

        for (let i = -1*this.food_radius; i < this.food_radius+1; i++) {
            let j_bound = this.food_radius - Math.abs(i);
            for (let j = -1*j_bound; j < j_bound+1; j++) {
                if (this.in_bounds(x + i, y + j)) {
                    let food_source_state = this.states[x+i][y+j];
                    let factor = 1 - ((Math.abs(i) + Math.abs(j)) / (2*this.food_radius));
                    food_source_state.food_rate = factor * this.max_food_rate;
                }
            }
        }
    }


    initialize_strategy(strategy, label="") {
        let cellColor = random_color();
        let ran_x = Math.floor((this.columns / 2) * Math.random() + this.columns / 4);
        let ran_y = Math.floor((this.rows / 2) * Math.random() + this.rows / 4);
        this.initialize_strategy_loc(strategy, ran_x, ran_y, label);

    }

    initialize_strategy_loc(strategy, x, y, label="") {
        let cellColor = random_color();
        let first_cell = new Cell(cellColor, strategy, this.satiety, this.lifespan);
        let curr_grid_cell = this.states[x][y];

        curr_grid_cell.occupied = true;
        curr_grid_cell.cell = first_cell;
        curr_grid_cell.color = cellColor;

        this.add_cell_data(first_cell, label); 
    }

    add_cell_data(cell, label) {
        this.cell_data[cell.color] = {};
        let curr_cell_data = this.cell_data[cell.color];
        curr_cell_data.strategy = cell.strategy;
        curr_cell_data.count = 1;
        curr_cell_data.label = label;
    }

    get_num_neighbors(x, y) {
        let neighbors = 0;
        for (let k = -1; k < 2; k++) {
            for (let l = -1; l < 2; l++) {
                let curr_x = x + k;
                let curr_y = y + l;
                if (this.in_bounds(curr_x, curr_y) && this.states[curr_x][curr_y].occupied) {
                    neighbors += 1;
                }
            }
        }
        return neighbors;
    }

    simulate() {
        let next_board = this.new_board();
        // this gives priority based on order of iteration? randomize priority?
        // need to loop twice? 
        for (let i = 0; i < this.columns; i++) {
            for (let j = 0; j < this.rows; j++) {
                next_board[i][j] = copy_state(this.states[i][j]);
            }
        }
        for (let i = 0; i < this.columns; i++) {
            for (let j = 0; j < this.rows; j++) {
                next_board[i][j].process_food();
            }
        }
        for (let i = 0; i < this.columns; i++) {
            for (let j = 0; j < this.rows; j++) {
                let curr_grid_state = this.states[i][j];
                if (curr_grid_state.occupied) {
                    let curr_cell = curr_grid_state.cell;
                    let curr_strat = curr_cell.strategy;
                    let curr_move = curr_strat[curr_cell.clock % curr_strat.length];
                    let dir = curr_cell.direction;
                    let newX = i + dir[0];
                    let newY = j + dir[1];
                    // console.log(curr_cell.satiety);

                    // subtract a life point for each neighbor
                    // analogy: buildup of toxic waste? 
                    // let waste take time to decay? 
                    // too much information to represent visually? 

                    let neighbors = this.get_num_neighbors(i, j);
                    let hunger_factor = 1;
                    if (curr_cell.satiety <= 0) {
                        hunger_factor = 2;
                    }
                    curr_cell.lifespan -= Math.pow(this.decay, neighbors)*hunger_factor;

                    if (curr_cell.lifespan > 0 && !curr_cell.digesting) {
                        curr_cell.clock += 1;
                        // move forwards
                        if (curr_move == 0) {

                            if (this.in_bounds(newX, newY)) {
                                // wrap these four lines in a function somehow?
                                let potential_grid_state = this.states[newX][newY];
                                let next_grid_state = next_board[newX][newY];
                                if (!(potential_grid_state.occupied || next_grid_state.occupied)) {
                                    next_board[newX][newY].accept_cell(curr_cell);
                                    next_board[i][j].remove_cell();
                                }
                            }
                        }
                        // rotate left
                        else if (curr_move == 1) {
                            curr_cell.rot_left();
                        }
                        // rotate right
                        else if (curr_move == 2) {
                            curr_cell.rot_right()
                        }
                        // clone 
                        else if (curr_move == 3) {
                            if (curr_cell.satiety >= curr_cell.max_satiety * 0.9) {
                                if (this.in_bounds(newX, newY)) {
                                    // make clone cell function?
                                    let clone = copy_cell(curr_cell);
                                    clone.clock = 0;
                                    clone.lifespan = 100;
                                    clone.satiety = curr_cell.satiety / 2;
                                    curr_cell.satiety /= 2;
                                    let potential_grid_state = this.states[newX][newY];
                                    let next_grid_state = next_board[newX][newY];
                                    if (!(potential_grid_state.occupied || 
                                        next_grid_state.occupied)) {
                                        next_board[newX][newY].accept_cell(clone);
                                    }
                                }
                            }
                        }
                        // eat
                        else if (curr_move == 4) {
                            if (this.in_bounds(newX, newY)) {
                                let potential_grid_state = this.states[newX][newY];
                                let next_grid_state = next_board[newX][newY];
                                if ((potential_grid_state.occupied &&
                                    potential_grid_state.cell.color != curr_cell.color) ||
                                    (next_grid_state.occupied &&
                                    next_grid_state.cell.color != curr_cell.color)) {
                                    next_board[newX][newY].accept_cell(curr_cell);
                                    curr_cell.eat_food(next_board[i][j].cell.satiety * 0.75);
                                    next_board[i][j].remove_cell();
                                } 
                                curr_cell.digesting = true;
                            } 
                        }
                    } else if (curr_cell.digesting && curr_cell.lifespan > 0){
                        curr_cell.digesting = false;
                        next_board[i][j].accept_cell(curr_cell);
                    } else {
                        next_board[i][j].remove_cell();
                    }
                }
            }
        }
        this.states = next_board;
    }

    in_bounds(x, y) {
        return x >= 0 && x < this.columns && y >= 0 && y < this.rows;
    }
}

console.log("asdf");