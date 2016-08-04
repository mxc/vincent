#Vincent - Vital Information Necessarily Centralised

Vincent is a project to create a programmable API or library around DevOps 
tools such as Ansible, Chef, Puppet, Salt etc. It is hoped it will make
the  generation of config files for dev ops configuration management tools
easier to create, maintain and apply with persistence of historic results
for ease of querying.

<img align="right" src="images/vincent.jpg">

Vincent is a client server application written in JavaScript API and runs 
on Node. It consists of an API backed end and CLI front-end. It is 
intended to develop a web UI at a later date.  The current client is also
written in JavaScript to run on Node but a C client will be created to
avoid having to install node on client machines.

Vincent stored its configuration and history in JSON format for ease of 
querying. The framework has been built to allow for the development of 
engine plugins targeting different devops tools to  generate 
appropriate configuration files for the different tools. 

Currently Ansible support is being developed and it is planned, if the 
project is a success, that other engines will be added later.

The JSON configuration files can be built up interactively on the CLI or 
programmatically via script files. By allowing configurations to be 
programmed with a scripting language such as JavaScript much of the 
frustration some experience shoehorning logic into YML files and dealing
with the  vagaries of the YML files syntax can be avoided and 
configuration maintenance can be made much more fun and productive. Well
that is the theory - how successfully VINCent will be at  this remains to
be seen.

The project is still in a development stage and needs many more modules 
to be added to be useful. We had hoped to be in a more useful state but 
we have decided to publish what we have as our celebration of Mandela 
Day 2016.

**Demo of Vincent**

[![Vincent Introduction Video](https://img.youtube.com/vi/cnbI2wWye14/0.jpg)]
(https://www.youtube.com/watch?v=cnbI2wWye14 "Vincent in Action")

[Vincent Client can be found here](https://github.com/mxc/vincent-client)
 

##Development Environment Setup on Ubuntu/Debian - Vincent Server
####You will also need a recent version Ansible to run Vincent. One that has the JSON output formatter.
####[Get a recent version of Ansible here](http://docs.ansible.com/ansible/intro_installation.html#latest-releases-via-apt-ubuntu)

1. On an Ubuntu/Debian workstation install the following:
    * **"sudo apt-get install libpam0g-dev"** - this is needed for the pam support in node
    * **"sudo apt-get install build-essential"** - also needed by node for pam package
    * **"sudo apt-get install python"** - another dependency for node package pam
2. Create a directory for node js
    * **mkdir ~/bin**
    * **cd ~/bin**
3. Get node js - you can try use the one from your repository "apt-get install nodejs"
but it might be too old for Vincent's ES2015 syntax.
    * **wget "https://nodejs.org/dist/v6.3.1/node-v6.3.1-linux-x64.tar.xz"** 
    (this is the latest at time of writing 3 Aug 2016
4. Decompress node:
    * **tar -xvf node-v6.3.1-linux-x64.tar.xz**
5. Add the path to the node binaries to your .bashrc file and source it
    * **vi ~/.bashrc** -add the line export "**PATH=$PATH:~/bin/node-v6.3.1-linux-x64/bin**"
    at the bottom of the file
    * **. ~/.bashrc** - Source the file
6. Ensure git is install **sudo apt-get install git**
7. Make a directory for the project and clone the git repository:
    * **mkdir ~/projects**
    * **cd ~/projects**
    * **git clone https://github.com/mxc/vincent**
8. Now install Vincent's dependcies:
    * **cd vincent**
    * **npm install** -> go and read some Linux man pages while you wait
9. Generate some ssl certificates for use by Vincent
    * **cd ~/projects**
    * **openssl req -newkey rsa:2048 -nodes -keyout vincent.key -x509 -days 3650 -out vincent.crt**
10. Copy the conf-example/config.ini file to ~/.vincent/
    * **mkdir ~/.vincent**
    * **cp ~/projects/vincent/conf-example/config.ini ~/vincent/**
    * Edit the file config.ini for publickey and privatekey
        * publickey=~/projects/vincent.crt
        * privatekey=~/projects/vincent.key
11. Run vincent with
     * node lib/Main.js &
12. Run **netstat -lntp** and you should see node listening on port 1979

**Screen Cast of Vincent Server Environment Set Up**

[![Vincent Server Set Up](https://img.youtube.com/vi/1Nb3NwfjDgg/0.jpg)]
(https://www.youtube.com/watch?v=1Nb3NwfjDgg "Vincent in Action")


##Development Environment Setup on Ubuntu/Debian - Vincent Client

1. You will need to install nodejs to run the vincent-client so follow 
step 1-6 above.
2. Make a directory for the client
  * **mkdir ~/projects/vincent-client**
  * **cd ~/project/vincent-client**
3. Pull down the source code for Vincent-Client with
  * **git clone https://github.com/mxc/vincent-client.git**
4. Build the client
  * **npm install**
5. Run the client
 * **node lib/Vincentc.js**
 
**Screen Cast of Vincent Client Set Up** 

 [![Vincent Client Set Up](https://img.youtube.com/vi/8vmkZtjf3wU/0.jpg)]
 (https://www.youtube.com/watch?v=8vmkZtjf3wU "Vincent in Action")
 
###Another Demo of Vincent
 
 [![Vincent Demo](https://img.youtube.com/vi/JfJ7metro7Q/0.jpg)]
  (https://www.youtube.com/watch?v=JfJ7metro7Q "Vincent in Action")
  
