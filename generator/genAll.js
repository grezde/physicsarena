#!/bin/node
const { readOLE, readFile } = require('./readOL');
const { writeHTMLFromPdata, getCountryImage, readMyOLE } = require('./genHTML');
const fs = require('fs');

const argv = process.argv.slice(2);
const MODE = argv[0] === 'build' ? 'build' : 'debug';

const redirectStart = MODE == 'debug' ? '/public/' : '/';
const outputDir     = MODE == 'debug' ? 'public'   : 'temp';
const fileStart     = MODE == 'debug' ? '/files/'  : '/';
const redirects     = MODE == 'debug' ? false      : true;
console.log(MODE == 'debug' ? 'DEBUG MODE' : 'PRODUCTION MODE');

const ms = readOLE('manifest', 'manifest', {
    globalFlag: 'name',
    globalOptions: {
        'd': 'shortname',
        'p': 'plevel',
        'g': 'hasGrade',
        'c': 'cdisp'
    },
    iterFlag: 'exams',
    iterOptions: {
        'e': 'code',
        'l': 'locales'
    }
});

let pdatas = [], locales={};
for(let ol of ms)
    for(let ex of ol.exams)
        for(let loc of ex.locales.split(' ')) {
            locales[loc] = true;
            pdatas.push({
                ol: ol.name,
                exam: ex.code,
                loc: loc,
                loc2: ex.locales.split(' ')[0],
                hasGrade: !!+ol.hasGrade,
                plevel: +ol.plevel,
                cdisp: +ol.cdisp,
                redirectStart, fileStart, outputDir
            });
        }
for(let l in locales) {
    locales[l] = {};
    const lines = readFile('manifest', `lang-${l}.txt`).split('\n');
    for(let line of lines) {
        if(line[0] == '#')
            continue;
        let s = line.split('=');
        if(s.length == 2)
            locales[l][s[0]] = s[1];
    }
}
pdatas = pdatas.map(p => ({ ...p, lmap: locales[p.loc] }));

for(let p of pdatas) {
    writeHTMLFromPdata(p, ms);
    console.log(`Written ${p.loc}/${p.ol}/${p.exam}`);
}

const genRedirect = (path1, path2) => {
    if(!fs.existsSync(`../${outputDir}/${path1}`))
        fs.mkdirSync(`../${outputDir}/${path1}`, { recursive: true });
    const str = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>physicsarena - redirect</title>
        <meta http-equiv="refresh" content="0; url='${redirectStart}${path2}'" />
        <style>
            * {
                padding: 0;
                margin: 0;
                font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
            }
            body {
                background-color: rgb(253, 250, 236);
            }
            a {
                text-decoration: none;
            }
            a, a:visited {
                color: #0000ff;
                transition: color 0.1s ease-in-out;
            }
            a:active, a:hover {
                color: #006aff
            }
            nav {
                background-color:rgb(213, 218, 236);
                border-bottom: 1px solid rgb(113, 113, 113);
                padding: 5px 20px 8px 20px;
            }
            #container {
                padding-top: 20px;
                padding-left: 20px;
                padding-right: 20px;
                padding-bottom: 100px;
            }
            p {
                margin-bottom: 10px;
            }
        </style>
        <link rel="icon" href="${redirectStart}images/logo-en.png" type="image/x-icon" />
    </head>
    <body>
        <nav id="top">
            <h1>physicsarena</h1>
        </nav>
        <div id="container">
            <p>Automaticaly redirecting...</p>
            <p><a href="${redirectStart}${path2}">Manual redirect</a></p>
        </div>
    </body>
</html>
    `;
    fs.writeFileSync(`../${outputDir}/${path1}/index.html`, str);
};

if(redirects) {
    for(let ol of ms) {
        let ex0 = ol.exams[0].code;
        let l0 = ol.exams[0].locales.split(' ')[0];
        genRedirect(`${ol.name}`, `${l0}/${ol.name}/${ex0}`);
        const locales = {};
        for(let ex of ol.exams) {
            genRedirect(`${ol.name}/${ex.code}`, `${l0}/${ol.name}/${ex.code}`);
            for(let l of ex.locales.split(' '))
                locales[l] = true;
        }
        for(let l in locales) {
            ex0 = ol.exams.filter(e => e.locales.includes(l))[0].code;
            genRedirect(`${l}/${ol.name}`, `${l}/${ol.name}/${ex0}`);
        }
        console.log(`Written redirects for ${ol.name}`);
    }
}

const ls = [];
for(let l in locales)
    ls.push(l);
for(let l of ls) {

    let str = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${locales[l].homepage}</title>
                <link rel="stylesheet" href="${redirectStart}main.css" />
                <link rel="icon" href="${redirectStart}images/logo-${l}.png" type="image/x-icon" />
            </head>
            <body>
                <nav id="top">
                    <h1>${locales[l].physicsarena}</h1>
                    <div class="center"></div>
                    <p>${locales[l].language}</p>
                    <p>
                        <img class="language-image" height="14" src="${getCountryImage(l, { redirectStart })}" /> 
                    </p>
                    ${ls.filter(il => il != l).map(il => `
                        <p><a href="${redirectStart}${il}">
                            <img class="language-image" height="14" src="${getCountryImage(il, { redirectStart })}" /> 
                        </a></p>
                    `).join('')}
                </nav>
                <div id="container" class="indecs">
                    <h2>${locales[l].welcome}</h2>
                    ${locales[l].desc ?
                        `<p>${locales[l].desc.replaceAll('\\n', '<br>')}</p>`
                        : ''
                    }
                    <p>${locales[l].selectOly}</p>
                    <ul>
                        ${ms.filter(
                                ol => ol.exams
                                .reduce((a, e) => a+e.locales, '')
                                .includes(l)
                            ).map(
                                ol => [
                                ol, ol.exams
                                .filter(e => e.locales.includes(l))[0]
                            ]).map(
                                ([ol, e]) => `
                                <li>  
                                    <a href="${redirectStart}${l}/${ol.name}/${e.code}">
                                        ${ol.shortname} - ${readMyOLE(pdatas.filter(pdata =>
                                            pdata.loc === l &&
                                            pdata.exam === e.code &&
                                            pdata.ol === ol.name
                                        )[0]).metadata.translit}
                                    </a>
                                </li>
                        `).join('')}
                    </ul>
                </div>
            </body>
        </html>
    `;
    fs.writeFileSync(`../${outputDir}/${l}/index.html`, str);
    if(l == 'en')
        fs.writeFileSync(`../${outputDir}/index.html`, str);
    console.log(`Written index page for ${l}`);
}

    
console.log("Written all files");