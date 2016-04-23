var exec = require("child_process").exec;

function runr(file, args, callback) {
	var cmd = "Rscript {0} {1}"
		.replace("{0}", file)
		.replace("{1}", args || "");
	exec(cmd, function(error, stdout, stderr) {
		if (error) console.log(error);
		callback(stdout);
	});
}

module.exports = runr;