
import "../helpers/iframeLoader.js";
import axios from 'axios';
import React, {Component} from 'react';

export default class Editor extends Component {
    constructor() {
        super();
        this.currentPage = "index.html";
        this.state = {
            pageList: [],
            newPageName: ""
        }
        this.createNewPage = this.createNewPage.bind(this);
    }

    //метод для того, чтобы запрос на сервер осуществлялся после того, как страница отрендерилась
    componentDidMount() {
        this.init(this.currentPage);
    }

    //мктод инициализации страницы
    init(page) {
        this.iframe = document.querySelector('iframe');
        this.open(page);
        this.loadPageList();
    }

    //метод open для открытия страницы
    open(page) {
        this.currentPage = `../${page}?rnd=${Math.random()}`;
    
        axios
            .get(`../${page}`)
            .then(res => {
                console.log("Страница загружена");
                return this.parseStrToDOM(res.data);
            })
            .then(this.wrapTextNodes)
            .then(dom => {
                console.log("Текстовые узлы обернуты");
                this.virtualDom = dom;
                return dom;
            })
            .then(this.serializeDOMToString)
            .then(html => {
                console.log("DOM сериализован в строку");
                return axios.post("./api/saveTempPage.php", { html });
            })
            .then(() => {
                console.log("Временная страница сохранена");
                return new Promise((resolve) => {
                    this.iframe.onload = () => {
                        console.log("iframe загружен");
                        resolve();
                    };
                    this.iframe.load("../temp.html");
                });
            })
            .then(() => {
                console.log("Вызов enableEditing");
                this.enableEditing();
            })
            .catch(error => {
                console.error("Ошибка при открытии страницы:", error);
            });
    }

    //метод для включения редактирования
    enableEditing() {
        this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(element => {
            element.contentEditable = "true";
            element.addEventListener("input", () => {
                this.onTextEdit(element);
            })
        });
    }

    onTextEdit(element) {
        const id = element.getAttribute("nodeid");
        this.virtualDom.body.querySelector(`[nodeid="${id}"]`).innerHTML = element.innerHTML;
        console.log(this.virtualDom);
    }

    //превращение строк в DOM дерево 
    parseStrToDOM(str) {
        const parser = new DOMParser();
        return parser.parseFromString(str, "text/html");
    }

    //метод для оборачивания текстовых узлов
    wrapTextNodes(dom) {
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
            wrapper.contentEditable = "true";
            wrapper.setAttribute("nodeid", i);
        });

        return dom;
    }

    //метод для превращения DOM в строку
    serializeDOMToString(dom) {
        const serializer = new XMLSerializer();
        return serializer.serializeToString(dom);
    }

    //метод для загрузки страниц с сервера
    loadPageList() {
        axios
            .get("./api")
            .then(res => this.setState({pageList: res.data}))
    }

     //метод для загрузки страницы
     createNewPage() {
        axios
            .post("./api/createNewPage.php", { "name": this.state.newPageName })
            .then(() => this.loadPageList()) // Исправлено
            .catch(() => alert("Страница уже существует!"));
    }

     //метод удаления страницы
     deletePage(page) {
        axios
            .post("./api/deletePage.php", { "name": page })
            .then(() => this.loadPageList()) // Исправлено
            .catch(() => alert("Страницы не существует!"));
    }

    render() {
        // const {pageList} = this.state;
        // const pages = pageList.map((page, i) => {
        //     return (
        //         <h1 key={i}>{page}
        //             <a 
        //             href="#"
        //             onClick={() => this.deletePage(page)}>(x)</a>
        //         </h1>
        //     )
        // });

        return (
            <iframe src={this.currentPage} frameBorder="0"></iframe>
            // <>
            //     <input
            //         onChange={(e) => {this.setState({newPageName: e.target.value})}} 
            //         type="text"/>
            //     <button onClick={this.createNewPage}>Создать страницу</button>
            //     {pages}
            // </>
        )
    }
}