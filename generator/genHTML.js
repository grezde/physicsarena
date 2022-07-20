#!/bin/node
const { readOLE, combineOLE } = require('./readOL');
const fs = require('fs');

const readMyOLE = (pdata) => {
    const extractOptions = {
        globalFlag: 'year',
        globalOptions: {
            'c': 'country',
            'w': 'website'
        },
        iterFlag: 'problems',
        iterOptions: {
            't': 'topics',
            'n': 'title',
            'd': 'description'
        }
    };
    let a = readOLE(pdata.ol, pdata.exam, extractOptions);
    let b = readOLE(pdata.ol, `${pdata.exam}-${pdata.loc}`, extractOptions);
    let c = combineOLE(a, b, extractOptions);
    // POST PROCESSING
    if(pdata.ol == 'rmph') {
        for(let yr of c)
            yr.country = 'Romania';
    }
    if(pdata.hasGrade) {
        // TODO 
    }
    return c;
};

const mkdir = path => {
    if(!fs.existsSync(path))
        fs.mkdirSync(path, { recursive: true });
}

const getTitle = pdata => {
    if(pdata.loc == 'ro')
        return `Fizicarena - Probleme ${pdata.ol.toUpperCase()}`;
    return `Physicsarena - ${pdata.ol.toUpperCase()} Problems`;
}

const getCountryImage = cc => {
    return `https://countryflagsapi.com/png/${cc}`;
};

const getTopicName = (pdata, topic) => {
    const getTopicEn = () => {
        switch(topic) {
            case 'mech':    return 'Mechanics';
            case 'grav':     return 'Gravity';
            case 'fluid':   return 'Fluids';
            case 'thermo':  return 'Thermodynamics';
            case 'elec':    return 'Electrostatics';
            case 'mag':     return 'Magnetism';
            case 'osc':     return 'Oscillations';
            case 'waves':   return 'Waves';
            case 'quantum': return 'Quantum';
            case 'rel':     return 'Relativity';
            case 'nuc':     return 'Nuclear';
            case 'math':    return 'Mathematics';
            case 'circ':    return 'Circuits';
            default:        return 'Other';
        }
    };
    const getTopicRo = () => {
        switch(topic) {
            case 'mech':    return 'Mecanica';
            case 'grav':     return 'Gravitatie';
            case 'fluid':   return 'Fluide';
            case 'thermo':  return 'Termodinamica';
            case 'elec':    return 'Electrostatica';
            case 'mag':     return 'Magnetism';
            case 'osc':     return 'Oscilatii';
            case 'waves':   return 'Unde';
            case 'quantum': return 'Cuantica';
            case 'rel':     return 'Relativitate';
            case 'nuc':     return 'Nucleara';
            case 'math':    return 'Matematica';
            case 'circ':    return 'Circuite';
            default:        return 'Altele';
        }
    };
    switch(pdata.loc) {
        case 'ro': return getTopicRo();
        case 'en':
        default:   return getTopicEn();
    }
};

const htmlFromPdata = (pdata) => {
    const ole = readMyOLE(pdata);
    let str = `
        <ul class="oly oly-${pdata.ol}">
        ${ole.map(yr => `
            <li class="year-container year-container-${yr.year}">
                <h1 class="year-title year-title-${yr.year}">${yr.year}</h1>
                <img class="country-image country-image-${yr.year}" height="17" src="${getCountryImage(yr.country)}" />
                <h3 class="country-name country-${yr.year}">
                    <span>${yr.country}</span>
                </h3>
                ${yr.website ? `<p class="year-website year-website-${yr.year}"><a href="${yr.website}">${pdata.lmap.website}</a></p>` : '<!-- No website -->'}
                ${pdata.plevel == 1 ? `
                <h3 class="problems-links problems-links-${yr.year}">
                    <span class="problems-link-p"><a href="/files/${pdata.loc}/${pdata.ol}/${pdata.exam}/${yr.year}-p.pdf">${pdata.lmap.problems}</a></span>
                    <span class="problems-link-s"><a href="/files/${pdata.loc}/${pdata.ol}/${pdata.exam}/${yr.year}-s.pdf">${pdata.lmap.solutions}</a></span>
                </h3>
` : ''}
                <ul class="problems-container">
                ${yr.problems.map(pr => `
                    <li class="problem-container">    
                        <h3 class="problem-title problem-title-${yr.year}-${pr.id}">${pr.title}</h3>
                        ${pdata.plevel == 0 ? `
                        <h4 class="problem-links problem-links-${yr.year}-${pr.id}">
                            <span class="problem-link-p"><a href="/files/${pdata.loc}/${pdata.ol}/${pdata.exam}/${yr.year}-${+pr.id+1}-p.pdf">${pdata.lmap.problem}</a></span>
                            <span class="problem-link-s"><a href="/files/${pdata.loc}/${pdata.ol}/${pdata.exam}/${yr.year}-${+pr.id+1}-s.pdf">${pdata.lmap.solution}</a></span>
                        </h4>
` : ''}
                        <p class="problem-topics problem-topics-${yr.year}-${pr.id}">${pr.topics ? pr.topics.split(' ').map(t => `
                            <span class="problem-topic topic-${t}">${pdata.lmap[`t-${t}`]}</span> 
`).join('') : ''}</p>
                        ${pr.description ? `<p class="problem-desc problem-desc-${yr.year}-${pr.id}">${pr.description}</p>` : '<!-- No description -->'}
                    </li>
                `).join('')}
                </ul>
            </li>
        `).join('')}
        </ul>
    `;

    return str;

    
};

const writeHTMLFromPdata = (pdata, odata) => {
    let str = htmlFromPdata(pdata);
    const myo = odata.filter(x => x.name == pdata.ol)[0];
    const locales = myo.exams.filter(e => e.code == pdata.exam)[0].locales.split(' ');
    //const exams = [...new Set([].concat(...odata.map(o => o.exams.filter(e => e.locales.includes(pdata.loc)).map(e => e.code))))];
    str = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pdata.lmap.title.replace('%', myo.shortname)}</title>
        <link rel="stylesheet" href="/public/main.css" />
    </head>
    <body>
        <nav>
            <div class="left">
                <h1>physicsarena</h1>
                <p>${pdata.lmap.title.replace('%', myo.shortname)}</p>
                <p>-</p>
                <p>${pdata.lmap['exam-title'].replace('%', pdata.lmap[`e-${pdata.exam}`])}</p>
                <p class="separator"></p>
                ${myo.exams.filter(x => x.code != pdata.exam).map(x => `
                <p><a href="/public/${pdata.loc}/${pdata.ol}/${x.code}">${pdata.lmap[`e-${x.code}`]}</a></p>
                `)}
                <p><a href="/public/${pdata.loc}/${pdata.ol}/ex">ex</a></p>
                <p>${myo.exams.filter(x => x.code != pdata.exam).map(x => x.code)} </p>
                <p class="separator"></p>
                ${odata.filter(o => o.exams.filter(e => e.code == pdata.exam && e.locales.split(' ').includes(pdata.loc)).length > 0).map(o => `
                <p><a href="/public/${pdata.loc}/${o.name}/${pdata.exam}">${o.shortname}</a></p>
                `).join('')}
            </div>
            <div class="center"></div>
            <div class="right">
                <h1>_</h1>
                <p>${pdata.lmap.language}</p>
                <p>${pdata.loc}</p>
                ${locales.filter(l => l != pdata.loc).map(l => `
                <p><a href="/public/${l}/${pdata.ol}/${pdata.exam}">${l}</a></p>
                `).join('')}
                <p class="separator"></p>
                <p>${pdata.lmap.filter}</p>
            </div>
        </nav>
        <div id="container">
            ${str}
        </div>
    </body>
</html>
`;

    mkdir(`../public/${pdata.loc}/${pdata.ol}/${pdata.exam}`);
    fs.writeFileSync(`../public/${pdata.loc}/${pdata.ol}/${pdata.exam}/index.html`, str);
    return str;
};

const argv = process.argv.slice(2);
if(argv.length > 0) {
    const processData = {
        ol: argv[0] || 'ipho',
        exam: argv[1] || 'th',
        loc: argv[2] || 'en',
        hasGrade: false,
        plevel: 0
    };
    writeHTMLFromPdata(processData);
}

module.exports = {
    writeHTMLFromPdata
};