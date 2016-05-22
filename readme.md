V.I.N.Cent

For unix accounts authentication to work correctly the user which V.I.N.Cent runs as must be part of the shadow groups
to have the required permissions to read the shadow passwords file.

For npm install to wor you will need the pam development library installed.
"sudo apt-get install libpam0g-dev"

To Run Tests

create postgresql role 'vincent' with password 'pass' or change the configuration information in the config.ini file.
create a database 'vincent' owned by role 'vincnet' or change configuration details in config.ini. Postgres should be
listening on port 5432 or change the entry in the config.ini.

Make sure the user running tests has permissions to run docker commands. On Ubunut make them a member of the docker
group "usermod -a -G docker [login]"


