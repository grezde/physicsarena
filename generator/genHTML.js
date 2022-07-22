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
};

const getCountryImage = cc => {
    cc = cc.toLowerCase();
    const transf = {
        wde: 'deu',
        csk: 'cze'
    };
    if(['en', 'ede', 'ssr', 'ygs', 'www'].includes(cc))
        return `/public/images/c-${cc}.png`;
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

    const getProblemLinks = (identifier, elem='h3') => {
        const getfn = (echar) => {
            let l = '';
            if(fs.existsSync(`../files/${pdata.loc}/${pdata.ol}/${pdata.exam}/${identifier}-${echar}.pdf`))
                l = `/files/${pdata.loc}/${pdata.ol}/${pdata.exam}/${identifier}-${echar}.pdf`;
            if(fs.existsSync(`../files/${pdata.loc2}/${pdata.ol}/${pdata.exam}/${identifier}-${echar}.pdf`))
                l = `/files/${pdata.loc2}/${pdata.ol}/${pdata.exam}/${identifier}-${echar}.pdf`;
            return l;
        };
        const pl=getfn('p');
        const sl=getfn('s');
        if(!pl && !sl)
            return '';
        return `
            <${elem} class="problem-links">
                <span class="problem-link-p"><a target="_blank" href="${pl}">${pdata.lmap.problems}</a></span>
                <span class="problem-link-s"><a target="_blank" href="${sl}">${pdata.lmap.solutions}</a></span>
            </${elem}>
        `;
    };

    const problemLi = (identifier, pr) => {
        const pls = getProblemLinks(identifier, 'h4');
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
                <h1 class="year-title">${yr.year}</h1>
                ${pdata.cdisp & 1 ? `
                    <img class="country-image" height="17" src="${getCountryImage(yr.country)}" />` 
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
                ${pdata.plevel - pdata.hasGrade == 1 ? getProblemLinks(yr.year) : ''}

                <ul class="problems-container">
                    ${pdata.hasGrade ? 
                        Object.keys(yr.grades).map(grStr => `
                            <uL class="grade-container">
                                <h2>${pdata.lmap.group.replace('%', grStr)}</h2>
                                ${pdata.plevel == 1 ? getProblemLinks(`${yr.year}-${grStr.toLowerCase()}`) : ''}
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
        <link rel="stylesheet" href="/public/main.css" />
        <!-- This page was generated from raw olympiad data -->
    </head>
    <body>
        <nav id="top">
            <h1>physicsarena</h1>
            <div class="center"></div>
            <p>${pdata.lmap.language}</p>
            <p>
                <img class="language-image" height="14" src="${getCountryImage(pdata.loc)}" /> 
            </p>
            ${locales.filter(l => l != pdata.loc).map(l => `
                <p><a href="/public/${l}/${pdata.ol}/${pdata.exam}">
                    <img class="language-image" height="14" src="${getCountryImage(l)}" /> 
                </a></p>
            `).join('')}
            <p class="separator"></p>
            <p>${pdata.lmap.filter}</p>
            <p><a class="a-button" id="options-button">${pdata.lmap.options}</a></p>
        </nav>
        <nav id="bot">
            <p>${pdata.lmap['oth-title']}</p>
            
            ${myo.exams.length > 1 ? `
                <p class="separator"></p>
                ${myo.exams.filter(x => x.code != pdata.exam).map(x => `
                    <p><a class="a-button" href="/public/${pdata.loc}/${pdata.ol}/${x.code}">${pdata.lmap[`e-${x.code}`]}</a></p>
                `)}
            ` : ''}
            <p>${myo.exams.filter(x => x.code != pdata.exam).map(x => x.code)} </p>
            <p class="separator"></p>
            ${odata.filter(o => o.exams.filter(e => e.code == pdata.exam && e.locales.split(' ').includes(pdata.loc)).length > 0 && o.name != pdata.ol).map(o => `
                <p><a class="a-button" href="/public/${pdata.loc}/${o.name}/${pdata.exam}">${o.shortname}</a></p>
            `).join('')}
        </nav>
        <div class="component hidden" id="options-component">
            <h3>Options</h3>
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
        <script type="text/javascript" src="/public/index.js"></script>
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