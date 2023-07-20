
import yargs from 'yargs/yargs';

// imports file system module
import fs from 'fs';

const argv = yargs(process.argv.slice(2))
.command('password-file <filepath>', 'Create a password file', (yargs) => {
  yargs.positional('filepath', {
    describe: 'password file path',
    type: 'string',
  })
})
.command('new-password <filepath> <name> <password>', 'Create a password file', (yargs) => {
  yargs.positional('filepath', {
    describe: 'password file path',
    type: 'string',
  }).positional('name', {
    describe: 'what the password for'
  }).positional('password', {
    describe: 'the password'
  })
})
.command('list <filepath>', 'List passwords', (yargs) => {
  yargs.positional('filepath', {
    describe: 'password file path',
    type: 'string',
  })
})
.command('get <filepath> <name>', 'List passwords', (yargs) => {
  yargs.positional('filepath', {
    describe: 'password file path',
    type: 'string',
  }).positional('name', {
    describe: 'password name',
    type: 'string',
  })
})
.parseSync();

const command = argv._[0]; 

// TODO: 
/*
a. find a way to create the folder or select it 
b. add a name to the json file.
b. store a json file with the keys name and password on it
*/

// object constructor for password
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Password {

  name: string;
  password: string;

  constructor(name: string, password: string) {
    this.name = name;
    this.password = password;
  }

} 

// validates string is a JSON file through string pattern recognition.
function validateJson(filepath: string) {
  return /\.json$/.test(filepath);
}

// creates a new JSON file to store encrypted passwords
 function  passwordFile(filepath: string | unknown) {

    // checks if filepath is string and validates it is a .json file, if not sends error message
    if(typeof filepath === 'string' && validateJson(filepath)) {
      // checks if filepath exists, if not, creates it 
      fs.access(filepath, (err) => {
        if(!err) {
          console.error(`${filepath} already exists`)
        } else {
          fs.writeFile(filepath, " ", (err) => {
            if (err) throw err;
            console.log(`JSON file at ${filepath} has been created`)
           });
        }
      })
    } else {
      console.error(`${filepath} is not a valid format, please enter a .json file.`)
    }
}

// use fs. writeFile, create an object, stringify and store it in the JSON
function newPassword(filepath: string | unknown, name: string | unknown, password: string | unknown) {
    // START EXAMPLE //
    console.log(`new-password ${filepath} ${name} ${password}`);
    console.log();
    console.log(`Create new name:password (${name}:${password}) pair in the password file (${filepath})`);
    // END EXAMPLE //
}

function listPasswords(filepath: string | unknown) {
    // START EXAMPLE //
    console.log(`list ${filepath}`);
    console.log();
    console.log(`List passwords in the password file (${filepath})`);
    console.log(`password names`);
    ['a', 'BB', 'CCC'].forEach(pw => console.log(pw));
    // END EXAMPLE //
}

function getPassword(filepath: string | unknown, name: string | unknown) {
    // START EXAMPLE //
    console.log(`get ${filepath} ${name}`);
    console.log();
    console.log(`Get a password by name from in the password file (${filepath})`);
    // END EXAMPLE //
}

if (command === 'password-file') {
    const { filepath } = argv;
    passwordFile(filepath);
}
if (command === 'new-password') {
    const { filepath, name, password } = argv;
    newPassword(filepath, name, password);
}
if (command === 'list') {
    const { filepath } = argv;
    listPasswords(filepath);
}
if (command === 'get') {
    const { filepath, name } = argv;
    getPassword(filepath, name);
}
