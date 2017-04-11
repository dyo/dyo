
var length = 1024*100; // enough to store 100kb of instrutions at any time
var action = new Uint8Array(length);
var memory = new Array(length);

// action carry instructions with pointers to memory for where to find the nodes to act on
// memory carries nodes that exist in memory

// for example

// - create node A

// memory = [{A...}]
// action = [0, 1, 0, 0, 0, 0, 0, 0, ...];
//
// 0 - address of the node in memory
// 1 - action (create)
// 0 - noop
// 0 - noop
//
// 0, 0, 0, 0 represents end of instructions
//
// the diff reads every 4 8bit unsigned ints when reading from actions.
// after an instruction is read its state returns to 0, 0, 0, 0 for the next set of
// instructions to write to
//
// action intructions can be from 0 - 255(unsigned 8bit int) detailing every possible high level DOM instruction
// generic ones like remove, insert, append, replace, update text, set attribute, remove attribute,
// and more granular ones like, set className, set id, set style, set event, emit event
//
// since memory and action arrays are flat they would need to be large enough to accommodate
// complex nested tree's represented in a flat structure thus the 1024*100(100kb) length
//
// and since it's an array buffer you can transfer it back and forth to and from a web worker
// allowing for some intresting multi-threaded diffing.

// amount of memory at disposal
var length = 1024*100;

// read from action, nullify(set to 0,0,0,0) instruction after processing
var actions = new Uint8Array(length);
// execute action on corrosponding tree, nullify(set to null) tree reference after action
var trees = new Array(length);

var index = 0;

function write (a, b, c, d) {
	actions[index] = a;
	actions[i+1] = b;
	actions[i+2] = c;
	actions[i+3] = d;
}

function read (a) {
	var pointer = actions[a];
	var a = actions[i+1];
	var b = actions[i+2];
	var c = actions[i+3];
}

function loop () {

}
