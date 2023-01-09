// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
var Airtable = require('airtable');

var base = new Airtable({apiKey: process.env.airApiKey}).base(process.env.airBaseID);


const getWords = async res => new Promise((resolve, reject) => {
  const data = [];
  base('Table 1').select({
    // Selecting the first 3 records in Grid view:
    maxRecords: 3,
    view: "Grid view"
  }).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function (record) {
      data.push(record.get('Words'));
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

  }, function done(err) {
    if (err) {
      console.error(err);
      reject(err)
      return;
    }
    res.status(200).json(data)
    resolve();
  });
});

const addWord = async (req, res) => new Promise((resolve, reject) => {
  const body = JSON.parse(req.body);
  if (!body.word) {
    reject('No word sent')
    return;
  }
  base('Table 1').create([
    {
      "fields": {
        "Words": body.word.toLowerCase(),
      }
    },
  ], function(err, records) {
    if (err) {
      console.error(err);
      reject(err);
      return;
    }
    records.forEach(function (record) {
      console.log(record.getId());
    });
    res.status(200).json({done: 'done'})
  });
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await addWord(req, res)
  } else {
    await getWords(res);
  }
}
