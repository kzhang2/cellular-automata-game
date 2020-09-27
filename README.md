# Cellular Automata Game 

## How to run locally
Because of browser security issues, rather than just open the index.html file 
it is necessary to serve the files from a web server. One simple way to do 
so is to run "python3 -m http.server" in a terminal while the terminal's current working directory 
is this repository and then navigate to localhost:8000.

## How to play the game 
The goal is to design an organism which will eliminate all other organisms (randomly spawned for now). 
There are currently five possible actions: advance, rotate left, rotate right, clone and eat. 
Each time step, each cell of each organism type does one of those five actions. 
A genome consists of a sequence of actions, which loops over time as long as cells containing that genome still exist. 

## TODOs
Add Perlin noise to food generation. \\
Support different kinds of actions. \\
Add reinforcement learning to search for optimal genomes. 