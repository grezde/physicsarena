#!/bin/node
const { readOLE, combineOLE, subcatOLE } = require('./readOL');
const fs = require('fs');

const readMyOLE = (pdata) => {
    const extractOptions = {
        globalFlag: 'year',
        globalOptions: {
            'c': 'country',
            'w': 'website'
        },
        subcatFlag: 'grades',
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
    let d = subcatOLE(c, extractOptions);
    // POST PROCESSING
    if(pdata.ol == 'rmph') {
        for(let yr of d)
            yr.country = 'Romania';
    }
    if(pdata.hasGrade) {
        // TODO 
    }
    return d;
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

    const getCorrectFilename = (identifier, echar) => {
        let l = '';
        if(fs.existsSync(`../files/${pdata.loc}/${pdata.ol}/${pdata.exam}/${identifier}-${echar}.pdf`))
            l = `/files/${pdata.loc}/${pdata.ol}/${pdata.exam}/${identifier}-${echar}.pdf`;
        if(fs.existsSync(`../files/${pdata.loc2}/${pdata.ol}/${pdata.exam}/${identifier}-${echar}.pdf`))
            l = `/files/${pdata.loc2}/${pdata.ol}/${pdata.exam}/${identifier}-${echar}.pdf`;
        return l;
    }

    const problemLi = (identifier, pr) => {
        const pl=getCorrectFilename(identifier, 'p');
        const sl=getCorrectFilename(identifier, 's');
        if(pdata.plevel == 0 && !pl && !sl) 
            return '';

        return `
            <li class="problem-container">    
                <h3 class="problem-title problem-title-${identifier}">${pr.title}</h3>
                ${pdata.plevel == 0 ? `
                    <h4 class="problem-links problem-links-${identifier}">
                        ${pl ? `<span class="problem-link-p"><a target="_blank" href="${pl}">${pdata.lmap.problem}</a></span>` : ''}
                        ${sl ? `<span class="problem-link-p"><a target="_blank" href="${sl}">${pdata.lmap.solution}</a></span>` : ''}
                    </h4>
                ` : ''}
                <p class="problem-topics problem-topics-${identifier}">
                    ${pr.topics ? 
                        pr.topics.split(' ').map(t => `
                            <span class="problem-topic topic-${t}">${pdata.lmap[`t-${t}`]}</span> 
                        `).join('') 
                    : ''}
                </p>
                ${pr.description ? `
                    <p class="problem-desc problem-desc-${identifier}">${pr.description}</p>` 
                : ''}
            </li>
        `;
    };

    const getProblemsLink = (year) => {
        if(pdata.level - pdata.hasGrade != 1)
            return '';
        const pl=getCorrectFilename(year, 'p');
        const sl=getCorrectFilename(year, 's');
        return `
            <h3 class="problems-links problems-links-${year}">
                <span class="problems-link-p"><a target="_blank" href="${pl}">${pdata.lmap.problems}</a></span>
                <span class="problems-link-s"><a target="_blank" href="${sl}">${pdata.lmap.solutions}</a></span>
            </h3>
        `;
    };

    let str = `
        <ul class="oly oly-${pdata.ol}">
        ${ole.map(yr => `
            <li class="year-container year-container-${yr.year}">
                <h1 class="year-title year-title-${yr.year}">${yr.year}</h1>
                ${pdata.cdisp & 1 ? `
                    <img class="country-image country-image-${yr.year}" height="17" src="${getCountryImage(yr.country)}" />` 
                : ''}
                ${pdata.cdisp & 2 ? `
                    <h3 class="country-name country-${yr.year}">
                        <span>
                            ${pdata.cdisp & 8 ? 
                                pdata.lmap[`c-${yr.country.toLowerCase()}`] 
                            : yr.country}
                        </span>
                    </h3>
                ` : ''}

                ${yr.website ? `
                    <p class="year-website year-website-${yr.year}"><a target="_blank" href="${yr.website}">${pdata.lmap.website}</a></p>` 
                : ''}
                ${pdata.plevel - pdata.hasGrade == 1 ? `
                    <h3 class="problems-links problems-links-${yr.year}">
                        <span class="problems-link-p"><a target="_blank" href="/files/${pdata.loc}/${pdata.ol}/${pdata.exam}/${yr.year}-p.pdf">${pdata.lmap.problems}</a></span>
                        <span class="problems-link-s"><a target="_blank" href="/files/${pdata.loc}/${pdata.ol}/${pdata.exam}/${yr.year}-s.pdf">${pdata.lmap.solutions}</a></span>
                    </h3>
                ` : ''}

                <ul class="problems-container">
                    ${pdata.hasGrade ? 
                        Object.keys(yr.grades).map(grStr => `
                            <uL class="grade-container">
                                <h2>${pdata.lmap.group.replace('%', grStr)}</h2>
                                ${pdata.plevel == 1 ? `
                                    <h3 class="problems-links problems-links-${yr.year}-${grStr.toLowerCase()}">
                                        <span class="problems-link-p"><a target="_blank" href="/files/${pdata.loc}/${pdata.ol}/${pdata.exam}/${yr.year}-${grStr.toLowerCase()}-p.pdf">${pdata.lmap.problems}</a></span>
                                        <span class="problems-link-s"><a target="_blank" href="/files/${pdata.loc}/${pdata.ol}/${pdata.exam}/${yr.year}-${grStr.toLowerCase()}-s.pdf">${pdata.lmap.solutions}</a></span>
                                    </h3>
                                ` : ''}
                                ${yr.grades[grStr].problems.map(x => problemLi(`${yr.year}-${grStr.toLowerCase()}-${+x.id+1}`, x)).join('')}
                            </ul>
                        `).join('')
                    : yr.problems.map(x => problemLi(`${yr.year}-${+x.id+1}`, x)).join('') }
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
        <!-- This page was generated from raw olympiad data -->
    </head>
    <body>
        <nav id="top">
            <h1>physicsarena</h1>
            <div class="center"></div>
            <p>${pdata.lmap.language}</p>
            <p>${pdata.loc}</p>
            ${locales.filter(l => l != pdata.loc).map(l => `
            <p><a href="/public/${l}/${pdata.ol}/${pdata.exam}">${l}</a></p>
            `).join('')}
            <p class="separator"></p>
            <p>${pdata.lmap.filter}</p>
            <p>${pdata.lmap.options}</p>
        </nav>
        <nav id="bot">
            <p>${pdata.lmap.title.replace('%', myo.shortname)}</p>
            <p>-</p>
            <p>${pdata.lmap['exam-title'].replace('%', pdata.lmap[`e-${pdata.exam}`])}</p>
            <p class="separator"></p>
            ${myo.exams.filter(x => x.code != pdata.exam).map(x => `
            <p><a href="/public/${pdata.loc}/${pdata.ol}/${x.code}">${pdata.lmap[`e-${x.code}`]}</a></p>
            `)}
            <p><a href="/public/${pdata.loc}/${pdata.ol}/ex">Practical</a></p>
            <p>${myo.exams.filter(x => x.code != pdata.exam).map(x => x.code)} </p>
            <p class="separator"></p>
            ${odata.filter(o => o.exams.filter(e => e.code == pdata.exam && e.locales.split(' ').includes(pdata.loc)).length > 0 && o.name != pdata.ol).map(o => `
            <p><a href="/public/${pdata.loc}/${o.name}/${pdata.exam}">${o.shortname}</a></p>
            `).join('')}
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