// Test script to diagnose login issue
const apiUrl = 'http://localhost:5000/api/auth/login';
const credentials = {
  email: 'alice@example.com',
  password: 'password123'
};

console.log('Testing direct backend call...');
console.log('URL:', apiUrl);
console.log('Credentials:', credentials);

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(credentials)
})
.then(res => {
  console.log('Response status:', res.status);
  return res.json();
})
.then(data => {
  console.log('Response data:', data);
  if (data.success) {
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('Token:', data.token.substring(0, 30) + '...');
    console.log('User:', data.user);
  } else {
    console.log('❌ LOGIN FAILED:', data.message);
  }
})
.catch(err => console.error('❌ ERROR:', err));
