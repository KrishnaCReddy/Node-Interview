const express = require('express')
let app = express();
const co = require('co');
const request = require('request');
let router = express.Router();
const fs = require('fs');
const bodyParser = require("body-parser");
app.use(express.json());
app.use(bodyParser.json());

app.use("/",router);

//creating server
app.listen(3006, function() {
    console.log('Example app listening on port 3006!')
});


//GET
router.get('/countries/all', async (req, res)=> {
    let modifiedArray = [];
    try {
        let country = await getCountries();
        country.map(eachCountry =>{
            var obj = {
                name: eachCountry.name,
                capital:eachCountry.capital,
                flag:eachCountry.flag ? eachCountry.flag.replace('https', 'sftp') : ""
            }
            modifiedArray.push(obj)
        });
        console.log("*** ",modifiedArray)
        res.send(modifiedArray);
    } catch (err) {

        res.send(err)
    }

});



//POST

router.post('/countries/search', function(req, res) {
    let modifiedArray = [];
    co(function*() {
        try {
            let country = yield getCountriesByKey(req.body.name);
            country.map(eachCountry =>{
                let obj = {
                    name: eachCountry.name,
                    capital:eachCountry.capital,
                    flag:eachCountry.flag ? eachCountry.flag.replace('https', 'sftp') : ""
                };

                modifiedArray.push(obj)
            });
            //console.log("*** ",modArray)
            fs.writeFileSync(Date.now().toString()+".json", JSON.stringify(modifiedArray), 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                }

                console.log("JSON file has been saved.");
            });
            res.send(modifiedArray);
        } catch (err) {
            res.send(err)
        }
    })
        .catch(function(err) {
            res.send(err)
        });
});


function getCountries() {
    return new Promise(function(resolve, reject) {
        let requestParam = {
            url: "https://restcountries.eu/rest/v2/all" ,
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        console.log(JSON.stringify(requestParam))
        request(requestParam, function(error, response, body) {
            if (error) {
                reject(error);
            }

            let obj = JSON.parse(body);
            if (obj.error) {
                reject(obj.error);
            }
            //console.log("****** "+JSON.stringify(obj))
            resolve(obj);
        });
    });

}

 function getCountriesByKey(name) {
    return new Promise(function(resolve, reject) {
        let requestParam = {
            url: "https://restcountries.eu/rest/v2/name/" + name ,
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        console.log(JSON.stringify(requestParam))
        request(requestParam, function(error, response, body) {
            if (error) {
                reject(error);
            }

            let obj = JSON.parse(body);
            if (obj.error) {
                reject(obj.error);
            }
            //console.log("****** "+JSON.stringify(obj))
            resolve(obj);
        });
    });

}