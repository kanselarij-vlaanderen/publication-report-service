import { app } from 'mu';

app.get('/', function (req, res) {
  res.send('Publication Reports Service says: "Hello world!"');
});
