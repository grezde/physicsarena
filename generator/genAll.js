#!/bin/node
const { readOLE, readFile } = require('./readOL');
const { writeHTMLFromPdata } = require('./genHTML');

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
                cdisp: +ol.cdisp
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
    
console.log("Written all files");