const fs = require('fs');

const requestHandler = function (req, res) {
  const url = req.url;
  const method = req.method;
  if (url === '/') {
    res.write(`
    <html>
        <body>
            <form action="/message" method="POST">
                <input type="text" name="message"><br>
                <input type="submit" value="Submit">
            </form>
        </body> 
    </html>
    `);
    return res.end();
  }
  if (url === '/message' && method === 'POST') {
    const body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });
    return req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split('=')[1];
      fs.writeFile('message.txt', message, (err) => {
        res.statusCode = 302;
        res.setHeader('Location', '/');
        return res.end();
      });
    });
  }
  res.setHeader('Content-Type', 'text/html');
  res.write(`
  <html>
    <body>
    
        <h1>My First Heading</h1>
        <p>My first paragraph.</p>
                        
    </body>
  </html>
    `);
  res.end();
};

module.exports = requestHandler;
