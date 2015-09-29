var fetch = require('node-fetch')
var cheerio = require('cheerio')
var camelcase = require('lodash.camelcase')


module.exports = parseWikiTable

function parseWikiTable(title, cb) {
    var apiUrl = wikiApiQueryUrl(title)

    fetch(apiUrl, {
            headers: {
                'User-Agent': 'Wikitable-To-JSON/1.0 (https://github.com/barberboy/wikitable-to-json'
            }
        })
        .then(function(res) {
            return res.json()
        })
        .then(extractPageContent)
        .then(convertWikitables)
        .then(cb)
}


function wikiApiQueryUrl(title) {
    return 'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(title) + '&prop=revisions&rvprop=content&format=json&rvparse'
}

function extractPageContent(json) {
    // so brittle!
    var pages = json.query.pages
    var content = pages[Object.keys(pages)[0]].revisions[0]['*']
    return content
}

function convertWikitables(content) {
    var $ = cheerio.load(content)
    var tables = []


    $('.wikitable').each(function(i, t) {
        var table = {
            title: '',
            headers: [],
            rows: []
        }

        t = $(t)

        // clean up the table
        t.find('.sortkey').remove()

        // title - use caption element if present, otherwise the closest heading
        table.title = clean(t.children('caption')) ||
            clean(t.prevAll('h1, h2, h3, h4, h5, h6').eq(0))

        // headers
        t.find('> tr > th').each(function(i, h) {
            var header = clean($(h))
            table.headers.push({
                key: key(header),
                text: header
            })
        })

        // rows
        t.find('> tr').each(function(idx, r) {
            var data = {}

            $(r).find('> td').each(function(idx, d) {
                // Store as key:data if we have headers, otherwise idx:data
                var k = table.headers[idx] ? table.headers[idx].key : idx
                data[k] = clean($(d))
            })

            // Don't store empty rows (or if we only had th)
            if (Object.keys(data).length) {
                table.rows.push(data)
            }
        })

        tables.push(table)
    })

    return tables
}

function clean(el) {
    return (el && el.text() || '').replace('[edit]', '').trim();
}

function key(heading) {
    return camelcase(heading)
}
