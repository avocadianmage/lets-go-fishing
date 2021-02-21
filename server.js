import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const port = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const endpointGetDeck = '/api/get-deck';

const createMoxfieldApiUrl = (moxfieldDeckUrl) => {
    const apiUrlPrefix = 'https://api.moxfield.com/v2/decks/all/';
    const deckUrlPieces = moxfieldDeckUrl.split('/');
    return apiUrlPrefix + deckUrlPieces[deckUrlPieces.length - 1];
};

app.post(endpointGetDeck, async (req, res) => {
    console.log({ endpoint: endpointGetDeck, body: req.body });

    const moxfieldApiUrl = createMoxfieldApiUrl(req.body.moxfieldDeckUrl);
    const response = await fetch(moxfieldApiUrl);
    const responseBody = await response.json();
    res.send(responseBody);
});

app.listen(port, () => console.log(`Server running on port ${port}...`));
