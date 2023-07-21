# LPM
## Local Password Mananger

```
# get repo
git clone git@github.com:dgomez04/localpasswordmanager.git

# install dependencies
cd /path/to/lpm
npm install

# generate encryption key
openssl rand -out encryption_key.txt 32

# build
npm run build

# run the demo commands

# help
$ node dist/index.js --help

# version
$ node dist/index.js --version

# password-file
$ node dist/index.js password-file ./password.json
password-file ./password.json

Create a JSON file at (./password.json) store the encrypted passwords

# new-password
$ node dist/index.js new-password ./password.json aws awspwd
new-password ./password.json aws awspw

Create new name:password (aws:awspwd) pair in the password file (./password.json)

# list
$ node dist/index.js list ./password.json
list ./password.json

List passwords in the password file (./password.json)
password names
a
BB
CCC
aws

# get
$ node dist/index.js get ./password.json aws
get ./password.json aws
awspw

Get a password by name from in the password file (./password.json)


```

