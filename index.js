#! /usr/bin/env node
/*
 * This file is an interactive command line script to help
 * start a new node module from the command-line
 *
 */
/* eslint-disable no-console */
var fs = require('fs');
var inquirer = require('inquirer');
var expander = require('expand-home-dir');
var pkg = require('../../package.json');
var sh = require('shelljs');

var gitProfiles = null;
var profileFname = null;
var message = null;
var userName = null;
var userEmail = null;
var userProfiles = null;
var questions = null;


try {
  /*
  .gitprofiles is meant to save frequently used git user profiles
  current format:
    {
      "profile1": {
        "username": "username1",
        "email": "email1@example.com"
      },
      "profile2": {
        "username": "username2",
        "email": "email2@example.com"
      }
    }
    */
  profileFname = expander('~/.gitProfiles');
  gitProfiles = JSON.parse(fs.readFileSync(profileFname));
} catch (err) {
  if (err.code !== 'ENOENT') {
    // this is probably an issue with the file format
    message = 'Error parsing ~/.gitprofile. Is it valid JSON? ' + err.message;
    err.message = message;
    throw err;
  } else {
    console.log('Did not find ~/.gitprofiles. Will ask user for profile information');
  }
}

userName = sh.exec('git config user.name').output.trim();
userEmail = sh.exec('git config user.email').output.trim();
userProfiles = null;
if (gitProfiles !== null) {
  userProfiles = Object.keys(gitProfiles);
  if (userProfiles !== null) {
    userProfiles.push('other');
  }
}

questions = [{
  type: 'input',
  name: 'name',
  message: 'New name for module',
  default: pkg.name,
}, {
  type: 'list',
  name: 'profile',
  message: 'Pick a profile to initialize with',
  choices: userProfiles,
  default: 'other',
  when: function when() {
    return gitProfiles !== null;
  },
}, {
  type: 'input',
  name: 'userName',
  message: 'git user.email for commit messages',
  default: userName !== '' ? userName : null,
  when: function when(answers) {
    return gitProfiles === null || answers.profile === 'other';
  },
}, {
  type: 'input',
  name: 'userEmail',
  message: 'git user.email for commit messages',
  default: userEmail !== '' ? userEmail : null,
  when: function when(answers) {
    return gitProfiles === null || answers.profile === 'other';
  },
}, {
  type: 'input',
  name: 'remoteRepo',
  message: 'reset remote repo url',
  default: null,
}];

inquirer.prompt({
  type: 'confirm',
  message: 'Do you want to customize this module?',
  default: true,
  name: 'customize',
}, function nested(_answers) {
  if (_answers.customize === false) {
    return;
  }
  inquirer.prompt(questions, function proc(answers) {
    var _userName = answers.userName === undefined ?
      gitProfiles[answers.profile].username : answers.userName;
    var _userEmail = answers.userEmail === undefined ?
      gitProfiles[answers.profile].email : answers.userEmail;

    // delete repo we cloned from
    sh.rm('-rf', './.git');
    // re-initialize repo
    sh.exec('git init');

    // update package.json
    if (pkg.name !== answers.name) {
      pkg.name = answers.name;
      delete pkg.scripts.postinstall;
      fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
      console.log('./package.json has been updated');
    }

    // update user config.
    if (_userName !== null) {
      sh.exec('git config user.name ' + _userName);
      console.log('git config user.name ' + _userName);
    }
    if (_userEmail !== null) {
      sh.exec('git config user.email ' + _userEmail);
      console.log('git config user.email ' + _userEmail);
    }

    // Before commiting any changes, we'll clean up any npm dependencies we
    // have to just enable this prepare functionality.
    sh.exec('npm uninstall --save-dev shelljs inquirer expand-home-dir');

    // Now add all current files to a changelist and commit.
    // .gitignore will be honored.
    sh.exec('git add .');
    sh.exec('git commit -m "Initial commit"');

    // The package morph is complete. Push to remote if requested
    if (answers.remoteRepo) {
      // initialize remore repo
      sh.exec('git remote add origin ' + answers.remoteRepo);
      sh.exec('git push -u origin master');
    } else {
      console.log('Once you have a git repo, type these commands to synchronize');
      console.log('the changes made here to the remote repo');
      console.log('  git remote add origin https://git.remote.repo.url');
      console.log('  git push origin master');
    }
  });
});
