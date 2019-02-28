/**
 *
 * @param {TemplateStringsArray} strings
 * @param  {...any[]} args
 */
const html = (strings, ...args) =>
  strings.reduce(
    (currentString, nextString, nextIndex) =>
      (currentString += (args[nextIndex - 1] || '') + nextString)
  );

export default html;
