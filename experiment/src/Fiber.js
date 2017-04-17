(function () {
	// normally would be around 10,000 / 10kb
	// for demo's sake, this is the upper-limit size of our memory
	// we don't intend to reach this since we resuse memory alot
	var size = 100|0;
	// these arrays are meant to be monomorphic types
	// they will only hold one type of struct
	// i.e Array<Uint8>, Array<Tree>, Array<Commit>
	// hopefully js VM's can optimize these better.
	var updates = new Array(size);
	var buffer = new Array(size);
	var memory = new Uint8Array(size);

	var index = 0;
	var address = 0;
	var pointer = 0;
	var start = 0;

	var a = 0; // first bit, address pointer
	var b = 0; // second bit, instruction
	var c = 0; // third bit, additional data in the form of a int signature
	var d = 0; // third bit, additional data in the form of a int signature

	var startTime = 0;
	var endTime = 0;
	var deltaTime = 0;
	var frameBudget = 1000/60;

	// calculates if we are still in budget
	function budget () {
		var endTime = Date.now();
		var deltaTime = endTime - startTime;

		if (deltaTime > frameBudget) {
			return true;
		} else {
			return (startTime = endTime - deltaTime % budget, false);
		}
	}
	// schedules resuming work based on priority it makes choice between
	// requestIdleCallback for low priority and requestAnimationFrame for high priority
	function schedule (priority) {
		switch (priority) {
			case 0: return requestAnimationFrame(walk);
			case 1: return requestIdleCallback(walk);
		}
	}
	// walks the through all work loads
	// and try to do as much work before the next frame
	// when the frame budget is exhausted, it schedules to call
	// itself again on the next frame depending on the priority
	// of the work
	function walk () {
		var i = index;
		var j = start;
		while (true) {
			if (budget()) {
				a = memory[i+0];
				b = memory[i+1];
				c = memory[i+2];
				d = memory[i+3];
				// we always release/restore memory to
				// it's idle state when we are done with it
				// so if we encouter 0, 0, 0, 0 we can assume
				// this the end of the work queue
				if (a + b + c + d === 0) {
					break;
				}
				// work
				patch(buffer[a], b, c, d);

				// release
				release(i, j);
				i+=4;
				j++;
			} else {
				schedule(0);
				break;
			}
		}
		// rset pointer address
		pointer = j;
	}
	// relase memory, to avoid changing the length of the arrays, memory is reused
	// as much as possible
	function release (i, j) {
		buffer[j] = void 0;
		memory[i] = memory[i+1] = memory[i+2] = memory[i+3] = 0;
	}
	// pushes a tree to buffer,
	// assigns a pointer to the buffer address and work type in memory
	function push (tree, type) {
		memory[address+0] = pointer;
		memory[address+1] = type;
		memory[address+2] = tree.async|0;
		memory[address+3] = tree.flag|0;
		buffer[pointer++] = tree;
		address += 4;
	}
	// patches a tree to represent it's final stage before commiting work
	function patch (tree, type, c, d) {

	}

	// commit an update
	// this is the enviroment specific piece
	// it doesn't care about the rest
	// it recieves work and commits the patches in one sync go
	// to a specific enviroment i.e DOM and Native can have different
	// commit implementations, optimally this is where
	// lifecycles like componentWillMount... will be called
	// and Nodes created/updated
	function commit () {

	}

	// this will log an empty buffer and empty memory
	// when no work is happening this will be the state of
	// our memory
	console.log(buffer, memory);

	// push work of type 2
	push({}, 2);
	// push work of type 255 (the maximum type int)
	push({}, 255);
	// assign a position to start commit work
	start = 0;
	// buffer has two objects, memory has
	//
	// 	0 - object address in buffer
	// 	2 - type of work
	// 	0 - additional data about the tree
	// 	0 - additional data about the tree
	//
	// 	1 - object address in buffer
	// 	255 - type of work
	// 	0 - additional data about the tree
	// 	0 - additional data about the tree

	// this will log an object filled with two objects
	// and the above [0, 2, 0, 0, 1, 255, 0, 0, ...]
	console.log(buffer, memory);
	// start work
	walk();

	// now it will log an empty buffer, and empty memory
	console.log(buffer, memory);
})();

