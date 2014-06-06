module.exports = [
	{
		command: 'pull',
		error: function(context, cmd){
			if(cmd.hasFlag('--ff-only')) return false;
			if(cmd.hasFlag('--rebase') || context.config['branch.autosetuprebase']==='always') return false;
			return 'You must specify either --ff-only or --rebase (or have branch.autosetuprebase set to "always").';
		},
	},

	{
		command: 'merge',
		error: function(context, cmd){
			if(context.branch!=='master' && context.branch!=='qa') return 'You must be on master or qa to merge.';
		},
	},

	{
		command: 'commit',
		warning: function(context, cmd){
			var exts = [
				// images
				'jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff',
				// art
				'ai', 'psd',
				// flash
				'swf', 'fla', 'flv', 'f4?',
				// documents
				'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
				// archives
				'tar', 'zip', 'tgz', '7z', 'gZ',
				// executables
				'exe', 'com',
			];
			var files = context.index.filterByExt(exts);
			console.log(exts);
			console.log(files);
			if(files.length) return "Are you sure you want to commit the following binary files?\n\t" + files.join('\n\t');
		}
	},

	{
		effect: 'newBranch',
		error: function(context, cmd){
			if(cmd.startPoint !== 'master') return "You must branch off of master.";
		}
	},
]
