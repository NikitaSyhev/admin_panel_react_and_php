
import "../helpers/iframeLoader.js";
import axios from "axios";
import React, {Component} from "react";

export default class Editor extends Component {
    constructor() {
        super();
        this.currentPage = "index.html";
        this.state = {
            pageList: [],
            newPageName: "",
        }

        this.createNewPage  = this.createNewPage.bind(this);
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
        this.currentPage = `../${page}`;

        axios
            .get(`../${page}`)
            .then(res=>this.parseStringToDOm(res.data))
            .then(this.wrapTextNodes)
            .then(this.serialiseDOMtoString)
            .then(html => axios.post("./api/saveTempPage.php", {html}))
            .then(()=>this.iframe.load("../temp.html"))
            .then( () => this.enableEditing())
    }

    //метод для включения редактирования

    enableEditing () {
        this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach( element =>{
            //присвоили атрибут
            element.contentEditable = "true";
        })
    }

    //превращение строк в DOM дерево 
    parseStringToDOm(str) {
        const parser = new DOMParser();
        return parser.parseFromString(str, "text/html");
    }

    //метод для оборачивания текстовых узлов
    wrapTextNodes(dom) {
        const body = dom.body;
        let textNodes = [];
        function recursy (element) {
            element.childNodes.forEach(node => {
                //добавляем ноды #text в массив textNodes
                if(node.nodeName === "#text" && node.nodeValue.replace(/\s+/g, "").length > 0) {          
                    textNodes.push(node);
                } else {
                    recursy(node);
                }
        })
        };
        recursy(body);
        //присваиваем атрибут Contenteditable к нодам ( нужно для редактирования текста)
        textNodes.forEach(node => {
            const wrapper = dom.createElement('text-editor');
            node.parentNode.replaceChild(wrapper, node);
            wrapper.appendChild(node);
        });
        return dom;
    }

    //метод для превращения DOM в строку
    serialiseDOMtoString(dom) {
        const serialiser = new XMLSerializer();
        return serialiser.serializeToString(dom);
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
            .post("./api/createNewPage.php", {"name": this.state.newPageName})
            //обновление страницы при создании страницы
            .then(res => this.loadPageList())
            .catch(() => alert("Страница уже существует!"));
    }

    //метод удаления страницы
    deletePage(page) {
        axios
            .post("./api/deletePage.php", {"name": page})
              //обновление страницы после удаления page
            .then(res => this.loadPageList())
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
            //      onChange={(e) => {this.setState({newPageName: e.target.value})}}
            //       type="text"></input>
            //     <button onClick={this.createNewPage}>Создать страницу</button>
            //     {pages}
            // </>
        )
    }
}
