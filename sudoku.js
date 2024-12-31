function docReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive')
        setTimeout(fn, 1);
    else
        document.addEventListener('DOMContentLoaded', fn);
} 

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

docReady(function() {
    const params = {};
    if (!document.location.search.includes('?')) throw new Error("Pas de version détectée");
    for (const param of document.location.search.split('?')[1].split('&')) {
        const [key,value] = param.split('=');
        params[key] = value;
    };
    
    for (let logo of document.querySelectorAll('.logo')) {
        logo.classList.add(params.version);
    }
    const level = +params.level || 10;
    const svg = document.getElementsByTagName('svg')[0];
    const xhttp = new XMLHttpRequest();
    xhttp.onloadend = function() {
        if (this.status === 404) {
            throw new Error("Aucune donnée trouvée");
        } else if (this.status === 200) {
            const datas = this.response.split('\n') 
            const maxCols = Math.max(...datas.map(d => d.length));
            const maxLines = datas.length;
            const specialsChars = [" ","@","&","/","'","-"," "];
            if (level < 10) {
                /** counter */
                const chars2 = datas.join('').split('').filter(c => !specialsChars.includes(c));
                const counter = chars2.filter(onlyUnique).map(c => {
                    return {
                        letter: c,
                        count: chars2.filter(k => k === c).length
                    }
                }).filter(c => c.count <= 10 - level).map(c => c.letter);
                specialsChars.push(...counter)
            }
            const size = 40;
            svg.setAttribute("viewBox", `0 0 ${(maxCols + 2) * size} ${(maxLines + 2) * size}`);
            const chars = datas.join('').split('').filter(onlyUnique).filter(c => !specialsChars.includes(c));


            shuffleArray(chars);
            let lineNumber = 1;
            let solution = '';
            for (let line of datas) {
                let columnNumber = 1;
                for (let char of line) {
                    const value = chars.indexOf(char)+1;
                    const margin = 5;
                    if (!!value) {
                        const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
                        rect.setAttribute("width",size);
                        rect.setAttribute("height",size);
                        if (solution) rect.setAttribute("class",solution);
                        rect.setAttribute("x",margin +columnNumber*size);
                        rect.setAttribute("y",lineNumber*size);
                        const text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
                        text.setAttribute("x",columnNumber*size + size);
                        text.setAttribute("y",lineNumber*size + size - margin);
                        text.textContent = value;
                        svg.appendChild(rect);
                        svg.appendChild(text);
                    } else if (char !== ' ') {
                        if (char === '/') solution = 'solution'
                        else {
                            // if (char === ' ') {
                                const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
                                rect.setAttribute("width",size);
                                rect.setAttribute("height",size);
                                rect.setAttribute("class",`space ${solution}`);
                                rect.setAttribute("x",margin +columnNumber*size);
                                rect.setAttribute("y",lineNumber*size);
                                svg.appendChild(rect);

                            // }
                            const text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
                            text.setAttribute("x",columnNumber*size + 25);
                            text.setAttribute("y",lineNumber*size + size/2);
                            text.setAttribute("class",'original');
                            text.textContent = char;
                            svg.appendChild(text);
                        }
                    }
                    columnNumber++;
                }
                lineNumber++;
            }
        }
    };
    xhttp.open("GET", `${params.version}/datas.txt`, true);
    xhttp.send();
});