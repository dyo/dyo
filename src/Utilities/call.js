/**
 * call function with context
 * 
 * @param  {function} func
 * @param  {any}      context
 * @param  {any}      arg
 * @return {any}
 */
function call (func, context, arg) {
	return func.call(context, arg);
}

