//--------------------- imports ---------------------
import {
    addParty,
    deleteRecord,
    getParties,
    getProcessed,
    getQueued,
    peekRecord,
    popRecord,
    queueRecord,
    requeueRecord,
    updateRecordAtHead
} from "./dbservice.js";
import express from "express";
import cors from "cors";
import { constants, handleJsonError } from "./utils.js";

const port = process.env.PORT || 3000;;
const app = express();

app.use(express.json());
app.use(handleJsonError);
app.use(express.static('public'));
app.use(cors());

//--------------------- Serve Assets -----------------
app.use(express.static("../frontend/build"));
//----------------------------------------------------

app.get("/api", (req, res) => {
    console.log('Ping Success...');
    res.status(200).send('API server is up & running...'); 
});

app.get("/api/peek", (req, res) => {
    console.log('Ping Success... Peeking');
    peekRecord()
        .then(response => res.status(response.statusCode).send(response.content))
        .catch(err => res.status(500).send(err.message))
});

app.get("/api/pop", (req, res) => {
    popRecord()
        .then(response => res.status(response.statusCode).send(response.content))
        .catch(err => res.status(500).send(err.message));
});

app.get("/api/queued", (req, res) => {
    getQueued()
        .then(response => res.status(response.statusCode).json(response.content))
        .catch(err => res.status(500).send(err.message));
});

app.get("/api/processed", (req, res) => {
    getProcessed()
        .then(response => res.status(response.statusCode).json(response.content))
        .catch(err => res.status(500).send(err.message));
});

app.get("/api/parties", (req, res) => {
    getParties()
        .then(response => res.status(response.statusCode).json(response.content))
        .catch(err => res.status(500).send(err.message));
});

app.get("/api/requeue/:id", (req, res) => {
    requeueRecord(req.params.id)
        .then(response => res.status(response.statusCode).json(response.content))
        .catch(err => res.status(500).send(err.message));
});

app.get("/api/delete/:id", (req, res) => {
    deleteRecord(req.params.id)
        .then(response => res.status(response.statusCode).send(response.content))
        .catch(err => res.status(500).send(err.message));
});

app.get("/api/transactions", (req, res) => {
    res.status(200).json(GetAllTransactions());
})

app.get("/api/transactions/delete/:Id", (req, res) => {
    const status = DeleteTransaction(req.params.Id);
    res.status(status).end();
})

app.post("/api/push", (req, res) => {
    if (Object.keys(req.body).length > 0) {
        queueRecord(req.body)
            .then(response => res.status(response.statusCode).send(response.content))
            .catch(err => res.status(500).send(err.message));
    }
    else
        res.status(400).send(constants.errors.missingParams);
});

app.post("/api/update", (req, res) => {
    if (Object.keys(req.body).length > 0 && body.Rate && isNaN(parseInt(body.Rate))) {
        updateRecordAtHead(req.body)
            .then(response => res.status(response.statusCode).send(response.content))
            .catch(err => res.status(500).send(err.message));
    }
    else
        res.status(400).send(constants.errors.missingParams);
});

app.post("/api/parties", (req, res) => {
    if (Object.keys(req.body).length > 0) {
        addParty(req.body)
            .then(response => res.status(response.statusCode).send(response.content))
            .catch(err => res.status(500).send(err.message));
    }
    else
        res.status(400).send(constants.errors.missingParams);
});

app.post("/api/transactions", (req, res) => {
    if (Object.keys(req.body).length > 0 && req.body.Location) {
        try {
            AddTransaction(req.body);
            res.status(201).end();
        }
        catch (e) { res.status(500).send(e.message) }
    }
    else
        res.status(400).send("Bad Request: Parameters Missing");
})


app.all("*", (req, res) => {
    res.status(404).end();
})

app.listen(port, '0.0.0.0', () => console.log(`Emandi Server running on ${port}`));