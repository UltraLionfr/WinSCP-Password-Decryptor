# WinSCP Password Decryptor

This is a simple API that uses Node.js and Express to decrypt passwords stored in a `WinSCP.ini` file. The API reads the file, extracts the session details, decrypts the passwords and returns the decrypted information.

## How It Works

### Dependencies

The script uses the following Node.js modules:

- `express`: For creating the web server.
- `fs`: For reading the `WinSCP.ini` file.

### Encryption and Decryption

The script includes a custom encryption and decryption mechanism implemented in the `WinSCP` class. This class has two primary methods:

- `encrypt`: Encrypts a password.
- `decrypt`: Decrypts an encrypted password.

### Server Setup

1. **Decode Endpoint**: The `/decodeAll` endpoint reads the `WinSCP.ini` file, processes each session, and decrypts the passwords.

### Usage

1. Ensure you have Node.js installed on your machine.
2. Save the script to a file (e.g., `app.js`).
3. Place your `WinSCP.ini` file in the same directory as the script.
4. Install Express by running:
   ```bash
   npm install express
   ```
5. Run the script:
   ```bash
   node app.js
   ```
6. Open your browser and navigate to `http://localhost:3000/decodeAll` to see the decrypted session information.

### Example Output

The `/decodeAll` endpoint will output a JSON array with the following structure for each session:

```json
[
    {
        "session": "exampleSession",
        "username": "exampleUser",
        "hostname": "exampleHost",
        "decodedPassword": "examplePassword"
    },
]
```


**Disclaimer**: The author of this API (UltraLion) disclaims all responsibility for its use by end users. The user is fully responsible for their use of this API, including but not limited to any use that does not comply with applicable laws.
