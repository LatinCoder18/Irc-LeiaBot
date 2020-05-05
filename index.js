const irc = require('irc');
const request = require('request');
const fs = require('fs')
const youtube = require('scrape-youtube').youtube;
let Parser = require('rss-parser');
let parser = new Parser();


var client = new irc.Client('irc.segured.org', 'LeiaSkywalker', {
    userName: 'LeiaOrgana',
    realName: 'Princesa Leia Organa',
    channels: ['#dev_team'],
    debug: false,
    port: 6667
});
client.addListener('registered', function () {
    client.say('nickserv', 'identify ' + "TheForce*");
})

client.addListener('invite', function (channel, from, message) {
    console.log(channel,from,message);
    
    client.join(channel, function (params) {
        console.log(params);
        
    });
})

client.addListener('error', function (message) {
    //console.log('error: ', message);
});

client.addListener('message', function (from, to, message) {
    
    console.log(from + ' => ' + to + ': ' + message);

    var msg = message.split(' ');
    var fro = from.toString();

    if (msg.length > 1) {
        if (msg[0] == '!covid' && msg[1].toUpperCase() == 'CUB') {
            getCovidCuba(to, msg[1]);
        } else if (msg[0] == '!frase') {
            decirFrase(to, fro, msg[1]);
        } else if (msg[0] == '!piropo') {
            decirPiropo(to, fro, msg[1]);
        } else if (msg[0] == '!insulto') {
            if (msg[1] == 'LukeSkywalker') {
                decirPiropo(to, fro, msg[1]);
            } else {
                decirInsulto(to, fro, msg[1]);
            }
            
        }
        else if (msg[0] == '!youtube') {
            searchYoutube(msg[1], to);
        }

        else if (msg[0] == '!news!!!!') {
            updateNews(fro);
        }
        else {

        }
    } else {
        if (message == '!frase') {
            decirFraseR(to, from)
        } else if (message == '!ayuda') {
            client.say(to, from + ' : ' + "Puede probar los siguientes comandos !covid CUB, !frase, !frase Nick, !insulto Nick, !piropo Nick, !youtube nombre de la cancion y cantante todo junto sin espacios ;) ");
        }
        else if (msg[0] == '!disconnect' && fro =='LukeSkywalker') {
            client.disconnect('The Force is Leaving The Server',function (params) {
                console.log(params);
                
            });
        }

         else {

        }
    }



});

function getCovidCuba(test, country) {
    var resultado;
    request('https://covidapi.info/api/v1/country/' + country.toString().toUpperCase() + '/latest', { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        console.log(body.result);

        resultado = ("En " + "Cuba" + " hay: " + "Casos Confirmados: " + body.result['2020-05-03'].confirmed + " Muertes: " + body.result['2020-05-03'].deaths + " Casos Recuperados: " + body.result['2020-05-03'].recovered)
        client.say(test, resultado);
    });
    console.log(country);
    return resultado;
}
function getClima() {
    request('api.openweathermap.org/data/2.5/weather?q=CUBA&appid=f14debd3577be84250b8573264d13e4c', { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        // resultado = ("En " + country + " hay:" + "Casos Confirmados: " + body.result['2020-04-30'].confirmed + " Muertes: " + body.result['2020-04-30'].deaths + " Casos Recuperados: " + body.result['2020-04-30'].recovered)
        client.say(test, resultado);
    });
    console.log(country);
}
function decirFraseR(to, from) {
    fs.readFile('chorras/frases.txt', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        data = data.toString('utf8');
        data = data.split('\n');
        console.log(data);
        var aleatorio = Math.round(Math.random() * data.length);
        client.say(to, from + ':' + data[aleatorio]);
    });
}
function decirFrase(to, from, mess) {
    fs.readFile('chorras/frases.txt', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        data = data.toString('utf8');
        data = data.split('\n');
        console.log(data);
        var aleatorio = Math.round(Math.random() * data.length);
        client.say(to, mess + " ," + from + " le dedica esta fráse: " + data[aleatorio]);

    });
}
function decirPiropo(to, from, mess) {
    fs.readFile('chorras/pirospos.txt', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        data = data.toString('utf8');
        data = data.split('\n');
        console.log(data);
        var aleatorio = Math.round(Math.random() * data.length);
        client.say(to, mess + " ," + from + " le dedica este hermoso piropo: " + data[aleatorio]);

    });
}
function decirInsulto(to, from, mess) {
    fs.readFile('chorras/insultos.txt', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        data = data.toString('utf8');
        data = data.split('\n');
        console.log(data);
        var aleatorio = Math.round(Math.random() * data.length);
        client.say(to, mess + " ," + data[aleatorio]);
    });
}
function updateNews(fro) {
    var title;
    var from = fro;
    (async () => {

        let feed = await parser.parseURL('http://www.cubadebate.cu/feed');
        //  console.log(feed.title);

        feed.items.forEach(item => {
            // console.log(item.title + ' : ' + item.link)

            title = item.title;
            sayNew(item.title, from);
        });

    })();


}
function sayNew(params, from) {

    client.say(from, params);
}

function searchYoutube(string, fro) {
    youtube.searchOne(string).then(results => {
        client.say(fro, results["title"] + " " + results["link"] + " - " + results["duration"] + " segs");

    });
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
function flipCoin(params) {
    var coin = {
        '0': 'cruz',
        '1': 'cara'
    }
    var aleatorio = Mat.round
}
