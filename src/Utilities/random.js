/**
 * generate random string of a certain length
 * 
 * @param  {number} length
 * @return {string}
 */
function random (length) {
    var text = '';

    // 52 is the length of characters in the string `randomChars`
    for (var i = 0; i < length; i++) {
        text += randomChars[Math.floor(Math.random() * 52)];
    }

    return text;
}

