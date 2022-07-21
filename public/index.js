
window.onload = e => {

    const hideItem = (className, lsName) => {
        if(!!localStorage.getItem(lsName)) {
            let es = document.getElementsByClassName(className);
            for(let i=0; i<es.length; i++)
                es[i].classList.add('hidden');
        }
    };
    hideItem('country-image', 'options-flags');
    hideItem('country-name', 'options-cname');
    hideItem('year-website', 'options-website');
    hideItem('problem-topics', 'options-topics');
    hideItem('problem-desc', 'options-desc');
    hideItem('problem-title', 'options-name');

    document.getElementById('options-button').onclick = e => {
        document.getElementById('options-component').classList.toggle('hidden');
    };

    document.getElementById('options-form').onsubmit = e => {
        e.preventDefault();
        if(e.submitter.classList.contains('hide-button')) {
            document.getElementById('options-component').classList.toggle('hidden');
            return;
        }
        for(let i=0; e.target[i].type != 'submit'; i++) {
            if(e.target[i].checked)
                localStorage.setItem(e.target[i].id, 'H'); 
            else
                localStorage.removeItem(e.target[i].id);
        }
        location.reload();
    };
};