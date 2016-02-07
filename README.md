# npm-post-install
Help configuring a boilerplate git repo to fit custom npm modules.

Boiler plate repos are an excellent tool to get started quickly. 
It's however tedious to remember to do all the things that reconfigure the repo
to specific projects. 

This script is meant as a post-install binary that will reset package.json
and the git repo to the boiler plate as the initial commit. 

What this script does:
 1. Seeks user input for:
    1. new name & description for new npm module
    2. picks a gitprofile from ~/.gitprofile (see below for format)
    3. alternatively, seeks a username and email to configure the git repo
    4. a git url to initialize the repo with
 2. Rejiggers the package.json
 3. Deletes previous git repository
 4. Reinitializes the git repo
 5. Configures a local username and email on the git repo.
 6. Commits current state as the 'Initial commit'
 7. Optionally (if a remote url is available), sets this up and pushes the changes to remote.

# Installation
    npm install npm-post-install

# Usage
    ./node_modules/.bin/npm-post-install

# .gitprofiles
It's common to have multiple git accounts and a constant pain to remember to set specific repos with proper username and emails. The ~/.gitprofiles is meant to provide a simple mechanism to store these. This module uses values in there to ease the typing. 

The .gitprofiles has a simple json format, an example shown below:

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

The .gitprofiles can have any number of these profiles, though realistically, only about 3 have been tested. YMMV. 
