import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const port = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const endpointGetDeck = '/api/get-deck';

app.post(endpointGetDeck, async (req, res) => {
    console.log({ endpoint: endpointGetDeck, body: req.body });

    const response = await fetch(req.body.moxfieldApiUrl);
    const responseBody = await response.json();
    res.send(responseBody);
});

app.listen(port, () => console.log(`Server running on port ${port}...`));
