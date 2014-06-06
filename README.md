#git-policy

Command-line Git wrapper that allows enforcing configurable project policy.

##Installation

First, install the npm package:

`npm install -g git-policy`

This will allow you to run git-policy, but it's not very interesting on its own: it basically prints any errors or warnings and returns an error code.  To make git-policy useful, you need a wrapper script.  Unfortunately, this cannot currently be incorporated into the npm package because there's no way to specify platform-specific scripts.

You will need to put a wrapper script on your path.  Shorter is better, and I like using simply "g" for the name of the script.  If that's too short for you, or conflicts with an existing utility, you can name it whatever you want.  I recommend putting in the same directory as Git:

###Linux, UNIX, BSD, OSX

You can determine where Git is installed by typing `which git`.  Put the following script in that directory:

https://github.com/EthanRBrown/git-policy/blob/master/g.sh

###Windows

You can determine where Git is installed by typing `where git`.  Put the following script in that directory:

https://github.com/EthanRBrown/git-policy/blob/master/g.cmd

##Rules

Now that you've got git-policy installed, you can create rule sets for your repository.  You do this by creating a `.gitpolicy.js` file in your project root (where your `.git` directory is).  Here's an example of that file:

    module.exports = [
        // example of policy restricting the use of 'pull'
	    {
			command: 'pull',
			error: function(context, cmd){
	            // fast-forward and rebase merges okay
				if(cmd.hasFlag('--ff-only')) return false;
				if(cmd.hasFlag('--rebase') || 
	                context.config['branch.autosetuprebase']==='always') return false;
				return 'You must specify either --ff-only or --rebase (or ' + 
	                'have branch.autosetuprebase set to "always").';
			},
		},
	
        // example of policy restricting gthe use of 'merge'
		{
			command: 'merge',
			error: function(context, cmd){
				if(context.branch!=='master' && context.branch!=='qa') return 
                    'You must be on master or qa to merge.';
			},
		},
	
        // example of policy restrictding the use of 'commit'
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
				if(files.length) return "Are you sure you want to commit ' +
                    'the following binary files?\n\t" + files.join('\n\t');
			}
		},
	
        // example of policy restricting commands that have the effect of
        // creating a new branch ('git branch <branchname>' or
        // 'git checkout -b <branchname>') 
		{
			effect: 'newBranch',
			error: function(context, cmd){
				if(cmd.startPoint !== 'master') return "You must branch off of master.";
			}
		},
	]

##Notes

Currently, errors and warnings are handled the same way: the script exits with an errorlevel of 1, preventing the Git command from being run.

Until you get used to using `g` instead of `git`, I recommend renaming your Git executable to `_git`; it'll prevent you from using Git without the protection of the policy wrapper.