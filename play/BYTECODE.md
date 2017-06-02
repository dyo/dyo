# Byte Code

## Form

```js
h('h1', 'Fox')
```

## Compiled

```js
const HEAPTAGS = ['#text', 'h1']
const HEAPSTRINGS = ['Fox']
const HEAPTYPES = [] // component classes/functions
const HEAPINSTANCES = [] // mounted instances

// Intermediate
{
	flag: 1
	type: -1,
	tag: 1,
	owner: -1,
	key: -1,
	children: [
		{
			flag: 3
			type: -1,
			tag: 0,
			owner: -1,
			key: -1,
			children: 0
		}
	]
}

// Compiled
const tree = [1, -1, 1, -1, -1, [[3, -1, 0, -1, -1, 0]]]

 // -1 means there is no value in memory.
// each interger is a memory address in the HEAP arrays
// In this case it translates to

tree:
	flag: 1, // tree has a flag 1(element)
	type: -1, // tree has no backing component
	tag: 1, // tree uses the tag at offset 1(HEAPTAGS(1) === 'h1')
	owner: -1, // tree has no backing instance
	key: -1, // no backing key (set keys are hashed: interger)
	children: // tree has children [...]
		child:
			flag: 3, // tree child has flag 3(text)
			type: -1, // tree child has no backing component instance
			tag: 0, // tree child has a tag at 0(HEAPTAGS(0) === '#text')
			owner: -1 // tree has no backing instance
			key: -1, // no backing key
			children: 0, // tree has string child at(HEAPSTRINGS(0) === 'Fox')
```

Example with a Component

```js
// ...
const HEAPTYPES = [Fn] // component classes/functions
const HEAPINSTANCES = [...] // mounted instances

// Intermediate
{
	flag: 1
	type: 0,
	// address of component class/function in memory
	// HEAPTYPES[type]
	tag: 1,
	owner: 0, 
	// address of the instance in memory
	// HEAPINSTANCES[owner]
	key: -1,
	children: [...]
}

// Compiled
[1, 0, 1, 0, -1, [...]]

// This way we only every need to diff addresses(intergers)
// and only need to access the underlining value when an action is flushed
```
