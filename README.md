# Password Hashing in NodeJS using Bcrypt

## Prerequisites

1. Basic Understanding of Node and JavaScript.
2. Node and NPM installed.

## How to Start

1. Clone the repo. 
2. Run `npm install`
3. Run `node server.js`
4. Server will be running at `locahost:5000`

## Config Files
A `config.json` file must be created before the starting the server. A sample `config.json` is shown below:

``` json
{
  "dbURI": "localhost:27017",
  "database": "amd-r",
  "port": 5000
}
```

**Note:** a new config entry called "jwtSecret" will be generated in the first run of the program. This is a secret used for hasing the passwords. Do not generate your own unless you know what you are doing as the secret should be cryptographically secure.

# TODO
  * [ ] Write better views
  * [ ] Better looking frontend
  * [ ] Organize server requests
  * [ ] Make AMD-R verification using RSA signing
  * [ ] Write jsdocs
  * [ ] Add feature to disable registration for AMD-R/users
  * [ ] User Authentication without JS 
