#!/bin/node
const { readOLE, combineOLE, subcatOLE } = require('./readOL');
const fs = require('fs');

const readMyOLE = (pdata) => {
    const extractOptions = {
        metaOptions: {
            'w': 'website',
            'c': 'country',
            's': 'source',
            'l': 'links',
            't': 'translit',
            'r': 'tlinks'
        },
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
    let c = readOLE(pdata.ol, 'sh', extractOptions);
    let d = readOLE(pdata.ol, `sh-${pdata.loc}`, extractOptions);
    let e = combineOLE(a, b, extractOptions);
    let f = combineOLE(c, d, extractOptions);
    let g = combineOLE(e, f, extractOptions);
    let h = subcatOLE(g, extractOptions);
    return h;
};

const mkdir = path => {
    if(!fs.existsSync(path))
        fs.mkdirSync(path, { recursive: true });
};

const getCountryImage = (cc, pdata) => {
    cc = cc.toLowerCase();
    const transf = {
        wde: 'deu',
        csk: 'cze'
    };
    if(['en', 'ede', 'ssr', 'ygs', 'www'].includes(cc))
        return `${pdata.redirectStart}images/c-${cc}.png`;
    if(transf[cc])
        cc = transf[cc];
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

    const getProblemLinks = (identifier, elem='h3', plural=false) => {
        const getfn = (echar) => {
            if(fs.existsSync(`../files/${pdata.loc}/${pdata.ol}/${pdata.exam}/${identifier}-${echar}.pdf`))
                return `${pdata.fileStart}${pdata.loc}/${pdata.ol}/${pdata.exam}/${identifier}-${echar}.pdf`;
            if(fs.existsSync(`../files/${pdata.loc2}/${pdata.ol}/${pdata.exam}/${identifier}-${echar}.pdf`))
                return `${pdata.fileStart}${pdata.loc2}/${pdata.ol}/${pdata.exam}/${identifier}-${echar}.pdf`;
            return '';
        };
        const pl=getfn('p');
        const sl=getfn('s');
        if(!pl && !sl)
            return '';
        return `
            <${elem} class="problem-links">
                ${pl ? `<span class="problem-link-p"><a target="_blank" href="${pl}">${plural ? pdata.lmap.problems  : pdata.lmap.problem }</a></span>` : ''}
                ${sl ? `<span class="problem-link-s"><a target="_blank" href="${sl}">${plural ? pdata.lmap.solutions : pdata.lmap.solution}</a></span>` : ''}
            </${elem}>
        `;
    };

    const problemLi = (identifier, pr) => {
        const pls = getProblemLinks(identifier, 'h4', false);
        if(pdata.plevel == 0 && pls == '') 
            return '';

        return `
            <li class="problem-container">    
                <h3 class="problem-title problem-title-${identifier}">${pr.title}</h3>
                ${pdata.plevel == 0 ? pls : ''}
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

    let str = `
        <ul class="oly oly-${pdata.ol}">
        ${ole.map(yr => `
            <li class="year-container year-container-${yr.year}">
                <h1 class="year-title">${yr.year.split('-').map(x => pdata.lmap[x] || x).join(' ')}</h1>
                ${pdata.cdisp & 1 ? `
                    <img class="country-image" height="17" src="${getCountryImage(yr.country, pdata)}" />` 
                : ''}
                ${pdata.cdisp & 2 ? `
                    <h3 class="country-name">
                        <span>
                            ${pdata.cdisp & 4 ? 
                                pdata.lmap[`c-${yr.country.toLowerCase()}`] 
                            : yr.country}
                        </span>
                    </h3>
                ` : ''}

                ${yr.website ? `
                    <p class="year-website"><a target="_blank" href="${yr.website}">${pdata.lmap.website}</a></p>` 
                : ''}
                ${pdata.plevel - pdata.hasGrade == 1 ? getProblemLinks(yr.year, 'h3', true) : ''}

                <ul class="problems-container">
                    ${pdata.hasGrade ? 
                        Object.keys(yr.grades).map(grStr => `
                            <uL class="grade-container">
                                <h2>${pdata.lmap.group.replace('%', grStr)}</h2>
                                ${pdata.plevel == 1 ? getProblemLinks(`${yr.year}-${grStr.toLowerCase()}`, 'h3', true) : ''}
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
    const ole = readMyOLE(pdata);
    const myo = odata.filter(x => x.name == pdata.ol)[0];
    const mye = myo.exams.filter(x => x.code != pdata.exam).filter(e => e.locales.includes(pdata.loc));
    const locales = myo.exams.filter(e => e.code == pdata.exam)[0].locales.split(' ');
    //const exams = [...new Set([].concat(...odata.map(o => o.exams.filter(e => e.locales.includes(pdata.loc)).map(e => e.code))))];
    const cbinput = (menu, name) => `
        <input type="checkbox" id="${menu}-${name}" name="${name}" />
        <label for="${name}">${pdata.lmap[`${menu}-${name}`]}</label>
        <br />
    `; 
    
    str = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pdata.lmap.title.replace('%', myo.shortname)}</title>
        <link rel="stylesheet" href="${pdata.redirectStart}main.css" />
        <link rel="icon" href="${pdata.redirectStart}images/logo-${pdata.loc}.png" type="image/x-icon" />
    </head>
    <body>
        <nav id="top">
            <h1><a class="no-color" href="${pdata.redirectStart}${pdata.loc}">${pdata.lmap.physicsarena}</a></h1>
            <div class="center"></div>
            ${locales.length >= 2 ? `
                <p>${pdata.lmap.language}</p>
                <p>
                    <img class="language-image" height="14" src="${getCountryImage(pdata.loc, pdata)}" /> 
                </p>
                ${locales.filter(l => l != pdata.loc).map(l => `
                    <p><a href="${pdata.redirectStart}${l}/${pdata.ol}/${pdata.exam}">
                        <img class="language-image" height="14" src="${getCountryImage(l, pdata)}" /> 
                    </a></p>
                `).join('')}
                <p class="separator"></p>    
            ` : ''}
            <!--<p>${pdata.lmap.filter}</p>-->
            <p><a class="a-button" id="options-button">${pdata.lmap.options}</a></p>
        </nav>
        <nav id="bot">
            <p>${pdata.lmap['oth-title']}</p>
            
            ${mye.length > 0 ? `
                <p class="separator"></p>
                ${mye.map(x => `
                    <p><a class="a-button" href="${pdata.redirectStart}${pdata.loc}/${pdata.ol}/${x.code}">${pdata.lmap[`e-${x.code}`]}</a></p>
                `)}
            ` : ''}
            <!--<p>${myo.exams.filter(x => x.code != pdata.exam).map(x => x.code)} </p>-->
            <p class="separator"></p>
            ${odata.filter(o => o.exams.filter(e => e.code == pdata.exam && e.locales.split(' ').includes(pdata.loc)).length > 0 && o.name != pdata.ol).map(o => `
                <p><a class="a-button" href="${pdata.redirectStart}${pdata.loc}/${o.name}/${pdata.exam}">${o.shortname}</a></p>
            `).join('')}
        </nav>
        <div class="component hidden" id="options-component">
            <h3>${pdata.lmap.options}</h3>
            <form id="options-form">
                ${['flags', 'cname', 'website', 'topics', 'desc', 'name', 'dark'].map(x => cbinput('options', x)).join('')}
                <input type="Submit" class="submit-button" value="${pdata.lmap.submit}" />
                <input type="Submit" class="hide-button" value="${pdata.lmap.hide}" />
            </form>
        </div>
        <div id="container">
            <div id="intro">
                <h2>${pdata.lmap['i-title'].replace('%', ole.metadata.translit || myo.shortname).replace('%', pdata.lmap[`e-${pdata.exam}`].toLowerCase())}</h2>
                ${ole.metadata.website ? `
                    <h4><a target="_blank" href="${ole.metadata.website}">${pdata.lmap['i-website']}</a></h4>
                ` : ''}
                ${ole.metadata.country ? `
                    <p>${pdata.lmap['organized-by'].replace('%', ole.metadata.country)}</p>
                ` : ''}
                ${ole.metadata.links ? `
                    <p>${pdata.lmap['i-resources']}</p>
                    <ul>
                        ${ole.metadata.links.split('\n').map((l, i) => `
                            <li>
                                <a href="${l}" target="_blank">${ole.metadata.tlinks ? (ole.metadata.tlinks.split('\n')[i] || l) : l}</a>
                            </li>
                        `).join('')}
                    </ul>
                ` : ''}
            </div>
            ${str}
        </div>
        <script type="text/javascript" src="${pdata.redirectStart}index.js"></script>
    </body>
</html>
`;

    mkdir(`../${pdata.outputDir}/${pdata.loc}/${pdata.ol}/${pdata.exam}`);
    fs.writeFileSync(`../${pdata.outputDir}/${pdata.loc}/${pdata.ol}/${pdata.exam}/index.html`, str);
    return str;
};

/*
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
*/
module.exports = {
    writeHTMLFromPdata, getCountryImage, readMyOLE
};