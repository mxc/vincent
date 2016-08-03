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
programmaticlly via script files. By allowing configurations to be 
programmed with a scripting language such as JavaScript much of the 
frustration some experience shoehorning logic into YML files and dealing
with the  vargaries of the YML files syntax can be avoided and 
configuration maintenance can be made much more fun and productive. Well
that is the theory - how successfuly VINCent will be at  this remains to
be seen.

The project is still in a development stage and needs many more modules 
to be added to be useful. We had hoped to be in a more useful state but 
we have decided to publish what we have as our celebration of Mandela 
Day 2016.

[![IMAGE ALT TEXT HERE](https://http://img.youtube.com/vi/cnbI2wWye14/0.jpg)]
(https://www.youtube.com/watch?v=http://img.youtube.com/vi/cnbI2wWye14/0.jpg)
 
