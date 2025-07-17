// Test session access from browser
fetch('/api/auth/session')
  .then(response => response.json())
  .then(data => console.log('Session:', data))
  .catch(error => console.error('Error:', error));
