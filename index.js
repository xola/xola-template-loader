const path = require("path");
const fs = require("fs");

module.exports = function (source) {
  // tell webpack that the output from this loader is cacheable
  this.cacheable();

  // match any ".js" file
  const re = /(\w+)\.js$/;
  const matches = re.exec(this.request);
  if (matches) {
    // since this is a ".js" file, we _may_ need to do some processing, so let webpack know that we'll be async
    var callback = this.async();

    // try to find a corresponding ".njk" file matching the base name of the ".js" file
    const filename = matches[1] + ".njk";
    var filepath = path.join(this.context, filename);
    fs.access(filepath, fs.constants.F_OK, function (err) {
      if (err) {
        // File does not exist, so just return the unmodified source
        callback(null, source);
      } else {
        // .njk file is present, so inject it
        const re = /export .*\{/;
        const matches = re.exec(source);
        if (matches) {
          // we are able to determine where to inject the template, so do it
          console.log("Injecting template " + filepath);
          const i = matches.index + matches[0].length;
          const out = "import Template from './" + filename + "';\n"
            + source.substring(0, i)
            + "\n  template: Template,"
            + source.substring(i);
          callback(null, out);

        } else {
          // we were unable to locate a position to inject the template in the source file, so just return it unmodified
          callback(null, source);
        }
      }
    });

  } else {
    // since this was not a ".js" file, there is no processing for us to do, so return the unmodified source
    return source;
  }
};
