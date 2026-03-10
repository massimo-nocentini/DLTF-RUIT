const express = require('express');
const keccak256 = require('keccak256')
const bodyParser = require('body-parser');
const cors = require('cors');
const { log, ExpressAPILogMiddleware } = require('@rama41222/node-logger');
const bc = require('./bc');

const config = {
    name: 'sample-express-app',
    port: 3000,
    host: '0.0.0.0',
};

const app = express();
const logger = log({ console: true, file: false, label: config.name });

app.use(bodyParser.json());
app.use(cors());
app.use(ExpressAPILogMiddleware(logger, { request: false }));

let oraclesSavedData = new Map(); //<rid,Map<oid,value>>




function saveOracleData(oid, rid, value){
    if(oraclesSavedData[rid]==undefined)
        oraclesSavedData[rid] = new Map()

    var round_data = oraclesSavedData[rid]
    round_data[oid] = value
    console.log("Value saved for oracle ", oid)
}



app.get('/getDataHash', (req, res) => {
    req_manager = req.query.reqmanager
    oid = req.query.oid
    depositlimitation_sc = req.query.depositlimitation
    fraudolent = req.query.fraudolent

    if(fraudolent=="y"){
        val = Math.floor(Math.random() * 100)
        res.status(200).send(val.toString());
        return
    }

    if(req_manager==undefined || oid==undefined || depositlimitation_sc==undefined){
        res.status(404).send('Error 1: incorrect parameters!');
        return
    }

    bc.getDataHash(req_manager, res, saveOracleData, oid, depositlimitation_sc)
});


app.post('/getSavedData', (req, res)=>{

    hash = req.body.hash
    oid = req.body.oid
    rid = req.body.rid
    if(oid==undefined || rid==undefined || hash==undefined){
        res.status(404).send('Error 4: incorrect parameters');
        return
    }
    if((oraclesSavedData[rid])[oid]==undefined){
        res.status(404).send('Error 5: value not set');
        return
    }
    val = (oraclesSavedData[rid])[oid].toString();
    var val_hash = keccak256(val).toString('hex')
    var bn = BigInt('0x' + val_hash.substring(0,32));
    if(bn.toString() == hash)
        res.status(200).send(val);
    else
        res.status(404).send();

})


app.get('/centralizedTest', (req, res)=>{
    res.status(200).send("10");
})

function parseNumberList(valuesCsv) {
    if (!valuesCsv) return null;
    const values = valuesCsv
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .map((v) => Number(v));
    if (values.length === 0) return null;
    if (values.some((n) => !Number.isFinite(n))) return null;
    return values;
}

let currentNumberServiceValues = parseNumberList(process.env.NUMBER_SERVICE_VALUES) || [1, 2, 3, 4];
let currentRequestId = 0;

function getNumbers(req) {
    const fromQuery = parseNumberList(req.query.values);
    if (fromQuery) return fromQuery;

    return currentNumberServiceValues;
}

app.get('/numbers', (req, res) => {
    const values = getNumbers(req);
    res.status(200).json({ rid: currentRequestId, values });
});

app.get('/sum', (req, res) => {
    const values = getNumbers(req);
    const sum = values.reduce((acc, v) => acc + v, 0);
    res.status(200).json({ rid: currentRequestId, sum, values });
});

function setNewRequest(values) {
    currentRequestId += 1;
    currentNumberServiceValues = values;
    const sum = values.reduce((acc, v) => acc + v, 0);
    return { rid: currentRequestId, sum, values: currentNumberServiceValues };
}

app.get('/newRequest', (req, res) => {
    const values = parseNumberList(req.query.values);
    if (!values) {
        res.status(400).json({ error: "Provide ?values=1,2,3 (numbers only)" });
        return;
    }
    res.status(200).json(setNewRequest(values));
});

app.post('/newRequest', (req, res) => {
    const values = Array.isArray(req.body?.values) ? req.body.values : null;
    if (!values || values.length === 0 || values.some((v) => !Number.isFinite(Number(v)))) {
        res.status(400).json({ error: "Provide JSON body: {\"values\":[1,2,3]}" });
        return;
    }
    res.status(200).json(setNewRequest(values.map((v) => Number(v))));
});

// Backwards-compatible alias.
app.get('/setNumbers', (req, res) => {
    const values = parseNumberList(req.query.values);
    if (!values) {
        res.status(400).json({ error: "Provide ?values=1,2,3 (numbers only)" });
        return;
    }
    res.status(200).json(setNewRequest(values));
});

// Backwards-compatible alias.
app.post('/setNumbers', (req, res) => {
    const values = Array.isArray(req.body?.values) ? req.body.values : null;
    if (!values || values.length === 0 || values.some((v) => !Number.isFinite(Number(v)))) {
        res.status(400).json({ error: "Provide JSON body: {\"values\":[1,2,3]}" });
        return;
    }
    res.status(200).json(setNewRequest(values.map((v) => Number(v))));
});




app.listen(config.port, config.host, (e)=> {
    if(e) {
        throw new Error('Internal Server Error');
    }
    logger.info(`${config.name} running on ${config.host}:${config.port}`);
});
