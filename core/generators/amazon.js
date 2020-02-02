const { runGenerators } = require('./common')
const path = require('path')
// A generator is a function that takes the user-inpuzt CLI args and produces some source code
const generators = {
  'Entry.java': function (cliArgs) {
    // TODO better name for entry-class
    // TODO improve this
    const className = cliArgs['--entry-class'].split(path.sep).slice(-1)[0].split('.')[0]
    return `
    import com.amazonaws.services.lambda.runtime.RequestHandler;
    import com.amazonaws.services.lambda.runtime.Context;
    import com.google.gson.JsonObject;
    import com.google.gson.Gson;

    public class Entry implements RequestHandler<JsonObject, String> {

      public String handleRequest(JsonObject event, Context context) {
        ${className} instance = new ${className}();
        JsonObject res = instance.${cliArgs['--entry-method']}(event);
        return new Gson().toJson(res);
      }
    }
  `
  }
}

/**
 *
 * @returns {[{fn, content}]} Array of { fn: ..., content: ... }
 */
function generateAll (cliArgs) {
  return runGenerators(cliArgs, generators)
}

module.exports = {
  generateAll
}
