const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const bucket = 'bucketname_tochange';
const file = 's3select.json';

exports.handler = async (event) => {

    //where condition (where key = value)
    var key = 'esempio_code';
    var value = 'seselect_lambda';

    //main query
    var query = ('SELECT * FROM s3object[*].esempio[*] s ');

    if (key != null) {
        query = query.concat('WHERE s.').concat(key).concat("='").concat(value).concat("';");
    } else query = query.concat(";");

    //const params for get data
    const params = {
      Bucket: bucket,
      Key: file,
      ExpressionType: 'SQL',
      Expression: query,
      InputSerialization: {
        JSON: {
          Type: 'DOCUMENT',
        }
      },
      OutputSerialization: {
        JSON: {
          RecordDelimiter: ','
        }
      }
    }

    //get data with function with s3-select
    const data = await getData(params);

    //custom payload response
    var responseCodeployJson = { msg: "success", status: "success", status_code: "200", data: data };
    var resp = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Authorization, Cache-Control, Origin, X-Requested-With, Content-Type, x-api-key",
        "Access-Control-Allow-Methods" :"HEAD,GET,POST,PUT,DELETE,PATCH,OPTIONS",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type":"application/json"
      },
      body: JSON.stringify(responseCodeployJson),
    };

    return resp;

};

// getdata in JSON object with s3select function
const getData = async (params) => {
  return new Promise((resolve, reject) => {
    S3.selectObjectContent(params, (err, data) => {
      if (err) { reject(err); }
      if (!data) {
        reject('Empty data object');
      }
      const records = []

      data.Payload.on('data', (event) => {
        // data are inside event.Records
        if (event.Records) {
          records.push(event.Records.Payload);
        }
      })
      .on('error', (err) => {
        reject(err);
      })
      .on('end', () => {
        let recordString = Buffer.concat(records).toString('utf8');
        recordString = recordString.replace(/\,$/, '');
        recordString = `[${recordString}]`;
        try {
          const recordData = JSON.parse(recordString);
          resolve(recordData);
        } catch (e) {
          reject(new Error(`Unable to convert data to JSON object. ${params.Expression}`));
        }
      });
    });
  })
}
