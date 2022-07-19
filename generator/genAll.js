#!/bin/node
const { readOLE } = require('./readOL');
const { writeHTMLFromPdata } = require('./genHTML');

const ms = readOLE('manifest', 'manifest', {
    globalFlag: 'name',
    globalOptions: {
        'd': 'shortname',
        'p': 'plevel',
        'g': 'hasGrade'
    },
    iterFlag: 'exams',
    iterOptions: {
        'e': 'code',
        'l': 'locales'
    }
});

const pdatas = [];
for(let ol of ms)
    for(let ex of ol.exams)
        pdatas.push(...ex.locales.split(' ').map(loc => ({
            ol: ol.name,
            exam: ex.code,
            loc: loc,
            hasGrade: !!+ol.hasGrade,
            plevel: +ol.plevel
        })));

for(let p of pdatas)
    writeHTMLFromPdata(p, ms);