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
		'Create a password',
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
	.command(
		'get <filepath> <name>',
		'Get password from a given key',
		(yargs) => {
			yargs
				.positional('filepath', {
					describe: 'password file path',
					type: 'string',
				})
				.positional('name', {
					describe: 'password name',
					type: 'string',
				})
		},
	)
	.parseSync()

const command = argv._[0]

// map to use for objects when creating or reading JSON files.
type jsonModel = {
	[name: string]: string
}

// validates string is a JSON file through string pattern recognition.
function validateJson(filepath: string) {
	return /\.json$/.test(filepath)
}

// reads data from the file, throws and returns empty object
function readData(filepath: string): jsonModel {
	try {
		const fileData = fs.readFileSync(filepath, 'utf-8')
		return JSON.parse(fileData)
	} catch (err) {
		return {}
	}
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
		// proceeds to read data from existing file, creates an empty object if not
		const existingData = readData(filepath)

		// checks if user name already exists in the json file
		if (existingData[name]) {
			console.error(`Error: The name "${name}" already exists.`)
			return
		}

		// assign user data to the object
		existingData[name] = encryptPassword(password)

		// write user data into the file
		fs.writeFile(filepath, JSON.stringify(existingData), (err) => {
			if (err) throw err
			console.log(`${name} succesfully added to ${filepath}`)
		})
	} else {
		console.error(`Error: The format is not valid.`)
	}
}

// lists all passwords available on asignated filepath
function listPasswords(filepath: string | unknown) {
	if (typeof filepath === 'string' && validateJson(filepath)) {
		// checks if filepath exists
		if (!fs.existsSync(filepath)) {
			console.error(`Error: ${filepath} does not exist.`)
			return
		}

		// use readData function
		const existingData = readData(filepath)

		if (Object.keys(existingData).length === 0) {
			console.log(`The object in ${filepath} is empty.`)
			return
		}

		// iterates through the parsed data and prints the key for each result
		console.log(`Avaialble passwords in ${filepath}:`)
		for (const key in existingData) {
			console.log(key)
		}
	} else {
		console.error(`Error: The format is not valid.`)
	}
}

// gets password for name in filepath
function getPassword(filepath: string | unknown, name: string | unknown) {
	if (
		typeof filepath === 'string' &&
		typeof name === 'string' &&
		validateJson(filepath)
	) {
		// checks if filepath exists
		if (!fs.existsSync(filepath)) {
			console.error(`Error: ${filepath} does not exist.`)
			return
		}

		// uses readData function
		const existingData = readData(filepath)

		// checks if existingData is empty
		if (Object.keys(existingData).length === 0) {
			console.log(`The object in ${filepath} is empty.`)
			return
		}

		// iterates through parsed data, matches entered name parameter with key and logs the decrypted password to the console.
		for (const key in existingData) {
			if (key === name) {
				console.log(decryptPassword(existingData[key]))
			}
		}
	} else {
		console.error(`Error: The format is not valid.`)
	}
}

// encrypts password utilizing createCipheriv function from Crypto module.
function encryptPassword(password: string) {
	const key = fs.readFileSync('encryption_key.txt')
	const iv = randomBytes(16)
	const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
	const encryptedPassword =
		cipher.update(password, 'utf-8', 'hex') + cipher.final('hex')
	return iv.toString('hex') + encryptedPassword
}

// decrypts password utilizing createDecipheriv function and the encryptedPassword from the JSON file.
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
