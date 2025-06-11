const bcrypt = require('bcryptjs');

async function run() {
  const password = 'test123'; 
  const hash = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hash);
}

run();