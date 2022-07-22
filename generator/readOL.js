#!/bin/node

const fs = require('fs');

const rmWhitespace = str => {
    let i = 0, j = str.length;
    const ws = ' \t\n\r';
    while(i < str.length && ws.includes(str[i]))
        i++;
    while(j > i && ws.includes(str[j-1]))
        j--;
    return str.substring(i, j);
};
const deepCopy = obj => {
    if(typeof obj != 'object' || obj === null)
        return obj;
    let newobj = {};
    for(let prop in obj)
        if(typeof obj[prop] == 'object')
            newobj[prop] = deepCopy(obj[prop]);
        else
            newobj[prop] = obj[prop];
    return newobj;
};
const readFile = (folder, filename) => fs.readFileSync(`../data/${folder}/${filename}.ol`).toString().split('\n').map(rmWhitespace).join('\n');

const readOL = (folder, filename) => {
    let lns;
    try {
        lns = readFile(folder, filename).split('\n');
    }
    catch(e) {
        return [];
    }
    let objs = [];
    for(let ln of lns) {
        if(ln[0] == '#')
            continue;
        if(ln[0] == '-') {
            let c = ln[1], d = ln.substring(3);
            objs[objs.length-1][1].push([c, d]);
        }
        else if(ln[0] == '+') {
            let d = ln.substring(3);
            let a = objs[objs.length-1][1];
            a[a.length-1][1] += '\n'+d;
        }
        else if(ln[ln.length-1] == ':')
            objs.push([ln.substring(0, ln.length-1), []]);
    }
    return objs;
};

const readOLE = (folder, filename, extr) => {
    let objs = readOL(folder, filename);
    let metao = objs.filter(x => x[0] == 'meta')[0];
    if(metao)
        objs = objs.filter(x => x[0] != 'meta');
    objs = objs.map(x => ({
        [extr.globalFlag]: x[0],
        [extr.iterFlag]: [],
        params: x[1],
    }));
    for(let x of objs) {
        for(let p of x.params) {
            if(extr.globalOptions[p[0]])
                x[extr.globalOptions[p[0]]] = p[1];
            if(extr.iterOptions[p[0]]) {
                let ar = x[extr.iterFlag];
                let name = extr.iterOptions[p[0]];
                if(ar.length == 0 || ar[ar.length-1][name])
                    ar.push({ [name]: p[1], id: ar.length });
                else    
                    ar[ar.length-1][name] = p[1];
            }
        }
        delete x.params;
    }
    objs.metadata = {};
    if(metao) {
        for(let p of metao[1])
            if(extr.metaOptions[p[0]])
                objs.metadata[extr.metaOptions[p[0]]] = p[1];
    }
    return objs;
};

const combineOLE = (oleA, oleB, ex) => {
    let oleC = [];
    const bmet = oleB.metadata;
    for(let e of oleA) {
        // get element out of second object
        let e2 = oleB.filter(x => x[ex.globalFlag] == e[ex.globalFlag]);
        if(e2.length == 0) {
            oleC.push(e);
            continue;
        }
        e2 = e2[0];
        oleB = oleB.filter(x => x != e2);
        // combine global properties
        for(let prop in e2)
            if(prop != ex.globalFlag && prop != ex.iterFlag)
                e[prop] = e2[prop];
        // combine iterators
        let ar = e[ex.iterFlag], ar2 = e2[ex.iterFlag];
        let ar3 = [];
        for(let p of ar) {
            // get element out of second object iterator
            let p2 = ar2.filter(x => x.id == p.id);
            if(p2.length == 0) {
                ar3.push(p);
                continue;
            }
            p2 = p2[0];
            ar2 = ar2.filter(x => x != p2);
            // combine iterator properties
            for(let iprop in p2)
                if(iprop != 'id')
                    p[iprop] = p2[iprop];
            ar3.push(p);
        }
        ar3.push(...ar2);
        e[ex.iterFlag] = ar3;
        oleC.push(e);
    }
    oleC.push(...oleB);
    oleC.metadata = { ...oleA.metadata, ...bmet };
    return oleC;
};

const subcatOLE = (ole, ex) => {
    if(!ex.subcatFlag)
        return ole;
    let ole2 = ole.filter(x => x[ex.globalFlag].split('.').length == 1).map(x => ({ ...x, [ex.subcatFlag]: {} }));
    ole2.metadata = ole.metadata;
    for(let x of ole) {
        let ar = x[ex.globalFlag].split('.');
        if(ar.length == 1)
            continue;
        let mother = ole2.filter(x => x[ex.globalFlag] == ar[0])[0];
        if(!mother)
            throw `Subcategory mother in ${x[ex.globalFlag]} does not exist`;
        mother[ex.subcatFlag][ar[1]] = x;
    }
    return ole2;
};

module.exports = {
    readOL, readOLE, combineOLE, readFile, subcatOLE
};