let moves_str = ["advance", "rotate left", "rotate right", "clone", "eat"];

export function test() {
    console.log("test modules");
}

export function random_color() {
	return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

//0: advance, 1: rotate left, 2: rotate right, 3: clone, 4: eat
export function createRandomStrategy(length) {
	var result = []
	for (var i = 0; i < length; i++) {
		var curr = Math.floor(5 * Math.random());
		result.push(curr);
	}
	return result
}

export function printStrategy(strat) {
	let out = "";
	for (let i = 0; i < strat.length; i++) {
		out += moves_str[strat[i]] + " | ";
	}
	return out;
}