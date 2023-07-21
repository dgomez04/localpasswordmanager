import yargs from 'yargs/yargs'

// imports file system module
import fs from 'fs'

// imports node crypto module
import crypto, { randomBytes } from 'crypto'

const argv = yargs(process.argv.slice(2))
	.command('password-file <filepath>', 'Create a password file', (yargs) => {
		yargs.positional('filepath', {
			describe: 'password file path',
			type: 'string',
		})
	})
	.command(
		'new-password <filepath> <name> <password>',
		'Create a password file',
		(yargs) => {
			yargs
				.positional('filepath', {
					describe: 'password file path',
					type: 'string',
				})
				.positional('name', {
					describe: 'what the password for',
				})
				.positional('password', {
					describe: 'the password',
				})
		},
	)
	.command('list <filepath>', 'List passwords', (yargs) => {
		yargs.positional('filepath', {
			describe: 'password file path',
			type: 'string',
		})
	})
	.command('get <filepath> <name>', 'List passwords', (yargs) => {
		yargs
			.positional('filepath', {
				describe: 'password file path',
				type: 'string',
			})
			.positional('name', {
				describe: 'password name',
				type: 'string',
			})
	})
	.parseSync()

const command = argv._[0]

// validates string is a JSON file through string pattern recognition.
function validateJson(filepath: string) {
	return /\.json$/.test(filepath)
}

// map to use for objects when creating JSON files.
type jsonModel = {
	[name: string]: string
}

// creates a new JSON file to store encrypted passwords
function passwordFile(filepath: string | unknown) {
	// checks if filepath is string and validates it is a .json file, if not sends error message
	if (typeof filepath === 'string' && validateJson(filepath)) {
		// checks if filepath exists, if not, creates it
		fs.access(filepath, (err) => {
			if (!err) {
				console.error(`${filepath} already exists`)
			} else {
				// initialize an empty object for storing encrypted passwords
				const initData: jsonModel = {}
				fs.writeFile(filepath, JSON.stringify(initData), (err) => {
					if (err) throw err
					console.log(`JSON file at ${filepath} has been created`)
				})
			}
		})
	} else {
		console.error(
			`${filepath} is not a valid format, please enter a .json file.`,
		)
	}
}

// adds a new name password pair to an existing .json file.
function newPassword(
	filepath: string | unknown,
	name: string | unknown,
	password: string | unknown,
) {
	// checks if values are strings and validates filepath is a .json file, if not sends error message
	if (
		typeof filepath === 'string' &&
		typeof name === 'string' &&
		typeof password === 'string' &&
		validateJson(filepath)
	) {
		// checks if filepath exists
		if (!fs.existsSync(filepath)) {
			console.error(`Error: The filepath ${filepath} does not exist.`)
			return
		}
		// proceeds to read data from existing file, throws error if it is not able to read data.
		let existingData: jsonModel = {}
		try {
			const fileData = fs.readFileSync(filepath, 'utf-8')
			existingData = JSON.parse(fileData)
		} catch (err) {
			console.error(`Error: ${filepath} was not able to be read.`)
			return
		}

		// checks if user name already exists in the json file
		if (existingData[name]) {
			console.error(`Error: The name "${name}" already exists.`)
			return
		}

		// assign user data to the object
		existingData[name] = encryptPassword(password)

		// write user data into the file
		fs.writeFile(filepath, JSON.stringify(existingData), (err) => {
			if (err) {
				throw err
			}
			console.log(`${name} succesfully added to ${filepath}`)
		})
	} else {
		console.error(`Error: The format is not valid.`)
	}
}

function listPasswords(filepath: string | unknown) {
	// START EXAMPLE //
	console.log(`list ${filepath}`)
	console.log()
	console.log(`List passwords in the password file (${filepath})`)
	console.log(`password names`)
	;['a', 'BB', 'CCC'].forEach((pw) => console.log(pw))
	// END EXAMPLE //
}

function getPassword(filepath: string | unknown, name: string | unknown) {
	// START EXAMPLE //
	console.log(`get ${filepath} ${name}`)
	console.log()
	console.log(`Get a password by name from in the password file (${filepath})`)
	// END EXAMPLE //
}
// encrypts password utilizing createCipheriv function from Crypto module.
function encryptPassword(password: string) {
	const key = fs.readFileSync('encryption_key.txt')
	const iv = randomBytes(16)
	const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
	const encryptedPassword =
		cipher.update(password, 'utf-8', 'hex') + cipher.final('hex')
	return +iv.toString('hex') + encryptedPassword
}
// decrypts password utilizing createDecipheriv function and the encryptedPassword from the JSON file.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decryptPassword(encryptedPassword: string) {
	const key = fs.readFileSync('encryption_key.txt')
	const iv = Buffer.from(encryptedPassword.slice(0, 32), 'hex')
	const encryptedContent = encryptedPassword.slice(32)
	const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
	const decryptedPassword =
		decipher.update(encryptedContent, 'hex', 'utf-8') + decipher.final('utf-8')
	return decryptedPassword
}

if (command === 'password-file') {
	const { filepath } = argv
	passwordFile(filepath)
}
if (command === 'new-password') {
	const { filepath, name, password } = argv
	newPassword(filepath, name, password)
}
if (command === 'list') {
	const { filepath } = argv
	listPasswords(filepath)
}
if (command === 'get') {
	const { filepath, name } = argv
	getPassword(filepath, name)
}
