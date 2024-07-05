const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Made by UltraLion');
    next();
});

function WinSCP() {
  var WSCP_CHARS = [];
  var WSCP_SIMPLE_MAGIC = 0xA3;
  var WSCP_SIMPLE_STRING = '0123456789ABCDEF';
  var WSCP_SIMPLE_MAXLEN = 50;
  var WSCP_SIMPLE_FLAG = 0xFF;
  var WSCP_SIMPLE_INTERNAL = 0x00;

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function _simple_encrypt_char(char) {
    char = ~char ^ WSCP_SIMPLE_MAGIC;

    var a = (char & 0xF0) >> 4;
    var b = (char & 0x0F) >> 0;

    return [WSCP_SIMPLE_STRING[a], WSCP_SIMPLE_STRING[b]].join('');
  }

  function _simple_decrypt_next_char() {
    if (WSCP_CHARS.length == 0) {
      return WSCP_SIMPLE_INTERNAL;
    }

    var a = WSCP_SIMPLE_STRING.indexOf(WSCP_CHARS.shift());
    var b = WSCP_SIMPLE_STRING.indexOf(WSCP_CHARS.shift());

    return WSCP_SIMPLE_FLAG & ~(((a << 4) + b << 0) ^ WSCP_SIMPLE_MAGIC);
  }

  // Encrypt password
  this.encrypt = function(username, hostname, password) {
    var salt = [username, hostname, password].join(''), shift = 0;

    if (salt.length < WSCP_SIMPLE_MAXLEN) {
      shift = rand(0, WSCP_SIMPLE_MAXLEN - salt.length);
    }

    result = [];
    result.push(_simple_encrypt_char(WSCP_SIMPLE_FLAG));
    result.push(_simple_encrypt_char(WSCP_SIMPLE_INTERNAL));
    result.push(_simple_encrypt_char(salt.length));
    result.push(_simple_encrypt_char(shift));

    for (var i = 0; i < shift; i++) {
      result.push(_simple_encrypt_char(rand(0, 256)));
    }

    for (var i = 0; i < salt.length; i++) {
      result.push(_simple_encrypt_char(salt[i].charCodeAt(0)));
    }

    while (result.length < WSCP_SIMPLE_MAXLEN * 2) {
      result.push(_simple_encrypt_char(rand(0, 256)));
    }

    return result.join('');
  }

  // Descrypt password
  this.decrypt = function(username, hostname, encrypted) {
    if (!encrypted.match(/[A-F0-9]+/)) {
      return '';
    }

    var result = [], key = [username, hostname].join('');

    WSCP_CHARS = encrypted.split('');

    var flag = _simple_decrypt_next_char(), length;

    if (flag == WSCP_SIMPLE_FLAG) {
      _simple_decrypt_next_char();
      length = _simple_decrypt_next_char();
    } else {
      length = flag;
    }

    WSCP_CHARS = WSCP_CHARS.slice(_simple_decrypt_next_char() * 2);

    for (var i = 0; i < length; i++) {
      result.push(String.fromCharCode(_simple_decrypt_next_char()));
    }

    if (flag == WSCP_SIMPLE_FLAG) {
      var valid = result.slice(0, key.length).join('');

      if (valid != key) {
        result = [];
      } else {
        result = result.slice(key.length);
      }
    }

    WSCP_CHARS = [];

    return result.join('');
  }
}

const winSCP = new WinSCP();
function decodePassword(username, hostname, encodedPassword) {
    const decodedPassword = winSCP.decrypt(username, hostname, encodedPassword);
    return decodedPassword;
}

app.get('/decodeAll', (req, res) => {
    const filePath = 'WinSCP.ini'; // Replace with the path to your WinSCP.ini file

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }

        const sessions = data.split('\n[').filter(session => session.startsWith('Sessions\\'));
        const decodedSessions = sessions.map(session => {
            const sessionName = decodeURIComponent(session.split(']')[0].replace('Sessions\\', ''));
            const usernameLine = session.split('\n').find(line => line.startsWith('UserName='));
            const hostnameLine = session.split('\n').find(line => line.startsWith('HostName='));
            const passwordLine = session.split('\n').find(line => line.startsWith('Password='));

            if (usernameLine && hostnameLine && passwordLine) {
                const username = usernameLine.split('=')[1].trim();
                const hostname = hostnameLine.split('=')[1].trim();
                const encodedPassword = passwordLine.split('=')[1].trim();
                const decodedPassword = decodePassword(username, hostname, encodedPassword);
                return {
                    session: sessionName,
                    username,
                    hostname,
                    decodedPassword
                };
            }
            return {
                session: sessionName,
                decodedPassword: 'Password not found'
            };
        });

        res.send(decodedSessions);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
