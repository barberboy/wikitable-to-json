var wikiTableToJSON = require('./wikitable-to-json')

module.exports = function(req, res) {
    if (req.params && req.params.title) {
        try {
            wikiTableToJSON(req.params.title, function(tables) {
                res.json({
                    status: "success",
                    data: tables
                })
            })
        }
        catch (e) {
            res.status(500).send("An error occurred :(")
        }
    }
    else {
        res.sendFile(__dirname + '/index.html')
    }
}