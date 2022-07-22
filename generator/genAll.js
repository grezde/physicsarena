#!/bin/node
const { readOLE, readFile } = require('./readOL');
const { writeHTMLFromPdata } = require('./genHTML');
const fs = require('fs');

const MODE = 'debug';
const redirectStart = MODE == 'debug' ? '/public/' : '';
const fileStart     = MODE == 'debug' ? '/files/'  : '';
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
                redirectStart, fileStart
            });
        }
for(let l in locales) {
    locales[l] = {};
    const lines = readFile('manifest', `lang-${l}`).split('\n');
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
    if(!fs.existsSync(`../public/${path1}`))
        fs.mkdirSync(`../public/${path1}`, { recursive: true });
    const str = `
<!DOCTYPE html>
<html>
    <head>
        <title>physicsarena</title>
        <meta http-equiv="refresh" content="0; url='${redirectStart}${path2}'" />
    </head>
    <body>
        <p>Automaticaly redirecting...</p>
        <p><a href="${redirectStart}${path2}">Manual redirect</a></p>
    </body>
</html>
    `;
    fs.writeFileSync(`../public/${path1}/index.html`, str);
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
    }
}
    
console.log("Written all files");