

import "../helpers/iframeLoader.js";

import axios from 'axios';
import React, {Component} from 'react';
import DOMHelper from "../helpers/dom-helper.js";
import EditorText from "../editor-text/";
import UIkit from "uikit";
import Spinner from "../spinner/spinner.js";
import ConfirmModal from "../confirm-modal/confirm-modal.js";
import ChooseModal from "../choose-modal/choose-modal.js";


export default class Editor extends Component {
    constructor() {
        super();
        this.currentPage = "index.html";
        this.state = {
            pageList: [],
            newPageName: "",
            loading: true,
        }
        this.createNewPage = this.createNewPage.bind(this);
        this.isLoading = this.isLoading.bind(this);
        this.isLoaded = this.isLoaded.bind(this);
        this.save = this.save.bind(this);
        this.init = this.init.bind(this);
      
    }
    //метод для того, чDOMhelper запрос на сервер осуществлялся после того, как страница отрендерилась
    componentDidMount() {
        //при загрузке страницы объект событе равен null, т.е. редиректа не будет
        this.init(null, this.currentPage);
    }

    //мктод инициализации страницы
    init(e, page) {
        if (e) {
            e.preventDefault();
        }
        this.isLoading();
        this.iframe = document.querySelector('iframe');
        this.open(page, this.isLoaded);
        this.loadPageList();
    }

    //метод open для открытия страницы
    open(page, cb) {
        this.currentPage = page;

        axios
            .get(`../${page}?rnd=${Math.random()}`)
            .then(res => DOMHelper.parseStrToDOM(res.data))
            .then(DOMHelper.wrapTextNodes)
            .then(dom => {
                this.virtualDom = dom;
                return dom;
            })
            .then(DOMHelper.serializeDOMToString)
            .then(html => axios.post("./api/saveTempPage.php", {html}))
            .then(() => this.iframe.load("../sjdnkjdsgn124234jdksnfksjn.html"))
            .then(() => axios.post("./api/deleteTempPage.php"))
            .then(() => this.enableEditing())
            .then(() => this.injectStyles())
            .then(cb);
    }
    //сохранение страницы на сервер
    save(onSuccess, onError) {
        console.log(this);
        this.isLoading();
        const newDom = this.virtualDom.cloneNode(this.virtualDom);
        DOMHelper.unwrapTextNodes(newDom);
        const html = DOMHelper.serializeDOMToString(newDom);
        axios
            .post("./api/savePage.php", {pageName: this.currentPage, html})
            .then(onSuccess)
            .catch(onError)
            .finally(this.isLoaded);
    }

    //метод для включения редактирования
    enableEditing() {
        this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(element => {
            const id = element.getAttribute("nodeid");
            const virtualElement = this.virtualDom.body.querySelector(`[nodeid="${id}"]`);
            new EditorText (element, virtualElement);
        });
    }

    //метод для добавления стилей
    injectStyles () {
        const style = this.iframe.contentDocument.createElement("style");
        style.innerHTML =`
            text-editor:hover {
                outline:3px solid orange;
                outline-offset: 8px;
            }
                text-editor:focus {
                outline:3px solid red;
                outline-offset: 8px;
            }
        `;
        this.iframe.contentDocument.head.appendChild(style);
    }

    //метод для загрузки страниц с сервера
    loadPageList() {
        axios
            .get("./api/pageList.php")
            .then(res => this.setState({pageList: res.data}))
    }

    createNewPage() {
        axios
            .post("./api/createNewPage.php", {"name": this.state.newPageName})
            .then(this.loadPageList())
            .catch(() => alert("Страница уже существует!"));
    }


     //метод удаления страницы
    deletePage(page) {
        axios
            .post("./api/deletePage.php", {"name": page})
            .then(this.loadPageList())
            .catch(() => alert("Страницы не существует!"));
    }


    //работа со спиннером
    isLoading() {
        this.setState({
            loading: true
        })
    }

    //метод срабатывает после загрузки спиннера
    isLoaded() {
        this.setState({
            loading: false
        })
    }



    render() {
        const {loading, pageList} = this.state;
        const modal = true;
        let spinner;
        
        loading ? spinner = <Spinner active/> : spinner = <Spinner />

        //где то теряется контекст в методе save
         //onClick - я поставл этот метод, так как в модальном окне почему то не отрабатывает Клик

        return (
            <>
                 <iframe src="" frameBorder="0"></iframe>
                
                {spinner}
               
                <div className="panel">
                    <button className="uk-button uk-button-primary uk-margin-small-right" uk-toggle="target: #modal-open" onClick={() => this.save()}>Открыть</button>
                    <button className="uk-button uk-button-primary" uk-toggle="target: #modal-save" onClick={() => this.save()}>Опубликовать</button>
                    <button className="uk-button uk-button-default" uk-toggle="target: #modal-backup">Восстановить</button>
                </div>
                
                <ConfirmModal modal={modal}  target={'modal-save'} method={this.save}/>
                <ChooseModal modal={modal}  target={'modal-open'} data={pageList} redirect={this.init}/>
                <ChooseModal modal={modal}  target={'modal-backup'} data={pageList} redirect={this.init}/>
            </>
        )
    }
}