const ws = require('ws');
const request = require('request');
const config = require('./config');

const debug = process.argv[2];

const HOST = config.HOST;
const TOKEN = config.TOKEN;
const STREAM = config.STREAM;
const POST_TO = config.POST_TO;

// WebSocket接続の確立
const mas = new ws(HOST + '/api/v1/streaming?access_token=' + TOKEN + '&stream=' + STREAM);

// toot受信時
mas.on('message',(data,flags) => {
    let raw = JSON.parse(data);
    are(raw).catch(e => {
        console.log("An Exception has occurred.");
        console.dir(e);
    });
});

// なぞのかんすう
const are = async (raw) => {
    if(typeof raw.event !== 'undefined' && raw.event === 'update'){
        let toot = JSON.parse(raw.payload);

        if(debug === 'debug')console.dir(toot);

        console.log(toot.created_at + " from:" + toot.account.username);
        console.log("URI : " + toot.uri);
        console.log(toot.content);
        if(debug !== 'debug')send_to_miss(toot.uri);
    }else{
        console.log("Status skipped because that is not 'update'.");
        console.dir(raw);
    }
    console.log("=============================================================");
};

// 飛ばし関数
const send_to_miss = (uri) => {
    request.post(
        {
            uri:POST_TO,
            headers:{
                'Content-type':'application/json'
            },
            json:{
                'uri':uri
            }
        },
        (err,response,body) => {
            if(err || debug){ // debugかエラーありで出力
                console.log("= err =========================================");
                console.dir(err);
                console.log("= response ====================================");
                console.dir(response);
                console.log("= body ========================================");
                console.dir(body);
                console.log("===============================================")
            }
        }
    );
};