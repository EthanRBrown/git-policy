#!/usr/bin/env node

var fs = require('fs'),
	path = require('path'),
	gitContext = require('./git-context.js');

var args = process.argv.slice(2);

// poyfill ES6 Array.prototype.find if necessary
if(!Array.prototype.find){
	Object.defineProperty(Array.prototype, 'find', {
		value: function(predicate){
			for(var i=0; i<this.length; i++) if(predicate(this[i])) return this[i];
		},
		enumerable: false,
	});
}

var cmd = {
	name: args.find(function(arg){ return !arg.match(/^-/); }),
	args: args,
	hasFlag: function(flag){
		return this.args.some(function(arg){ return arg===flag; });
	}
}

function getRules(context){
	var f = path.join(context.projectDir, '.gitpolicy.js');
	return fs.existsSync(f) && require(f);
}

gitContext(function(err, context){
	if(err) return console.error(err);

	var rules = getRules(context);
	if(!rules) return;					// nothing to do

	var cmdRules = rules.filter(function(rule) { return rule.command && rule.command === cmd.name; });

	cmdRules.forEach(function(rule){
		var err = rule.error && rule.error(context, cmd);
		if(err) console.error(err), process.exit(1);
		var warning = rule.warning && rule.warning(context, cmd);
		if(warning) {
			console.log(warning);
			process.exit(1);
			// TODO: interactivity
		}
	});
});

