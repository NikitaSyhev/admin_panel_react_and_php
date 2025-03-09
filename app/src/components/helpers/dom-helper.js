//в классе DOMHelper лежат все операции, которые работаюи с DOM деревом, но не принаджежат классу Editor

export default class DOMHelper {

    //превращение строк в DOM дерево 
    static parseStrToDOM(str) {
        const parser = new DOMParser();
        return parser.parseFromString(str, "text/html");
    }
    //метод для оборачивания текстовых узлов
    static wrapTextNodes(dom) {
        const body = dom.body;
        let textNodes = [];

        function recursy(element) {
            element.childNodes.forEach(node => {
                
                if(node.nodeName === "#text" && node.nodeValue.replace(/\s+/g, "").length > 0) {
                    textNodes.push(node);
                } else {
                    recursy(node);
                }
            })
        };

        recursy(body);

        textNodes.forEach((node, i) => {
            const wrapper = dom.createElement('text-editor');
            node.parentNode.replaceChild(wrapper, node);
            wrapper.appendChild(node);
            wrapper.setAttribute("nodeid", i);
        });

        return dom;
    }

     //метод для превращения DOM в строку
    static serializeDOMToString(dom) {
        const serializer = new XMLSerializer();
        return serializer.serializeToString(dom);
    }

    static unwrapTextNodes(dom) {
        dom.body.querySelectorAll("text-editor").forEach(element => {
            element.parentNode.replaceChild(element.firstChild, element);
        });
    }


    //оборачивание картинок
    static wrapImages(dom) {
        dom.body.querySelectorAll('img').forEach((img, i) => {
            img.setAttribute('editableingid', i);
        });
        return dom;
    }

    static unwwrapImages(dom) {
        dom.body.querySelectorAll('[editableingid]').forEach((img) => {
            img.removeAttribute('editableingid');
        });
    }
}