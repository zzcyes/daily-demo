 
export const appendBodyChild = (innerText,className,elsType="div")=>{
    const frag = document.createDocumentFragment();
    const els = document.createElement(elsType)
    className&&(els.setAttribute('class',className))
    els.innerText = innerText;
    frag.appendChild(els);
    document.body.appendChild(frag)
};