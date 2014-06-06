var exec = require('child_process').exec,
	path = require('path'),
	fs = require('fs');

var getGitDir = (function(){
	// TODO: sub-repos?
	// TODO: test on Linux
	// TODO: test on OSX
	var cwd, gitDir;
	return function(){
		if(gitDir && cwd === process.cwd()) return gitDir;

		cwd = process.cwd();
		var d = cwd;
		while(true){
			gitDir = path.join(d, '.git');
			if(fs.existsSync(gitDir) && fs.statSync(gitDir).isDirectory()) return gitDir;
			var up = path.dirname(d);
			if(up === d) return null;	// no repo found
			d = up;
		}
	}
})();

var getBranch = function(){
	var gd = getGitDir();
	var hf = path.join(gd, 'HEAD');
	if(!gd || !fs.existsSync(hf)) return null;
	var contents = fs.readFileSync(hf, { encoding: 'utf8' }).trim();
	// contents will either be "ref: ..." or a  commit id
	if(contents.match(/^ref: /)) return contents.split(':')[1].split('/').pop();
	return null;
}

var getIndex = function(cb){
	exec('git status --porcelain', function(err, stdout, stderr){
		if(err) return cb(err);
		if(stderr) return cb(stderr);

		cb(null, stdout
			.split('\n')
			.filter(function(line){ return line.match(/^[MARC]/); })
			.map(function(line){
				if(line.match(/^R/)){
					return line.substring(3).split(/ -> /)[1];
				} else {
					return line.substring(3);
				}
			})
		);
	});
}

function addFileListFunctions(fileList){
	Object.defineProperty(fileList, 'filterByExt', {
		value: function(exts){
			// make sure exts is an array
			if(typeof exts==='string') exts = [exts];
			// make sure all exts are lowercase, start with an escaped period, all metacharacters are
			// escaped, and it ends with a $ metacharacter
			exts = exts.map(function(ext){
				return new RegExp(
					ext.trim()
					.replace(/^[^.]/, '.$&')
					.replace(/[\\^$*+?.()|{}\[\]]/g, '\\$&')
					+ '$', 'i');
			});
			return this.filter(function(f){
				return exts.some(function(ext){ 
					return f.toLowerCase().match(ext); 
				});
			});
		}, 
		enumerable: false,
	});
}

function getConfig(cb){
	exec('git config -l', function(err, stdout, stderr){
		if(err) return cb(err);
		if(stderr) return cb(stderr);

		cb(null, stdout.split(/\n/g).reduce(function(c, l) { l = l.split('='); if(l.length==2) c[l[0].trim()] = l[1].trim(); return c; }, {}));
	});
}

module.exports = function(cb){
	var gitDir = getGitDir();
	if(!gitDir) return cb('Not a Git repository.');
	getIndex(function(err, index){
		if(err) return cb(err);

		getConfig(function(err, config){
			var context = { 
				gitDir: gitDir,
				projectDir: path.dirname(gitDir),
				index: index,
				config: config,
			};
			context.branch = getBranch();
			addFileListFunctions(context.index);
			cb(null, context);
		});
	});
};
