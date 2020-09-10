const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

request('https://charity.lt/biblija/mcgee_mp3.php', async function (error, response, body){
  const $ = cheerio.load(body);
  const root = `./audio_files`;
  !fs.existsSync(root) && fs.mkdirSync(root);

  let headers = $('h3');
  for ( let i = 0;i<headers.length; i++){
    
    let v = $(`h3`).eq(i);
    let book = $(v).text().trim();
    let book_trimmed = book.toLowerCase().replace(/\s/g,'_');
    console.log(`--- BOOK DOWNLOAD STARTED ( ${book} )---`);
    var dir = `${root}/${book_trimmed}`;
    !fs.existsSync(dir) && fs.mkdirSync(dir);
    
    let elements = $('ol li a', $(v).next('div'));
    for ( let ii = 0;ii<elements.length; ii++){

      let z = $(`ol li`, $(v).next('div')).eq(ii).find('a');
      let url = $(z).prop('href');
      let title_nr = $(z).text().trim().replace(book,'').toLowerCase().replace(/\s/g,'');
      let title_formatted = `${book_trimmed}_${ii+1}_(${title_nr})`;
      let full_path = `${dir}/${title_formatted}.mp3`;

      try {
        fs.accessSync(full_path, fs.constants.R_OK );
        console.error(`${title_formatted} - ALREADY EXISTS`);
      } catch (e) {
        await new Promise((resolve,reject)=>{
          console.log(`Download - ${title_formatted} - STARTED`);
          request(url)
            .on('error', e => reject(e))
            .pipe( fs.createWriteStream(full_path))
            .on('finish', () => {
              console.log(`Download - ${title_formatted} - DONE`);
              resolve();
            })
        })
      }
    }
  }
});