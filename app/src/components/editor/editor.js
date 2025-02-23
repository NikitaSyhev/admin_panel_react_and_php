

import "../helpers/iframeLoader.js";

import axios from 'axios';
import React, {Component} from 'react';
import DOMHelper from "../helpers/dom-helper.js";
import EditorText from "../editor-text/";

import UIkit from "uikit";

import Spinner from "../spinner/spinner.js";

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
    }
    //метод для того, чDOMhelper запрос на сервер осуществлялся после того, как страница отрендерилась
    componentDidMount() {
        this.init(this.currentPage);
    }

    //мктод инициализации страницы
    init(page) {
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
            .then(() => this.iframe.load("../temp.html"))
            .then(() => this.enableEditing())
            .then(() => this.injectStyles())
            .then(cb);
    }
    //сохранение страницы на сервер
    save(onSuccess, onError) {
       
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
            .get("./api")
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
        const {loading} = this.state;
        const modal = true;
        let spinner;
        
        loading ? spinner = <Spinner active/> : spinner = <Spinner />

        return (
            <>
                <iframe src={this.currentPage} frameBorder="0"></iframe>
                
                {spinner}

                <div className="panel">
                    <button className="uk-button uk-button-primary" uk-toggle="target: #modal-save" onClick={() => this.save()}>Опубликовать</button>
                </div>
                
                <div id="modal-save" uk-modal={modal.toString()}>
                    <div className="uk-modal-dialog uk-modal-body">
                        <h2 className="uk-modal-title">Сохранение</h2>
                        <p>Вы действительно хотите сохранить изменения?</p>
                        <p className="uk-text-right">
                            <button className="uk-button uk-button-default uk-modal-close" type="button">Отменить</button>
                            <button 
                                className="uk-button uk-button-primary uk-modal-close" 
                                type="button"
                                onClick={() => this.save(() => {
                                    UIkit.notification({message: 'Успешно сохранено', status: 'success'})
                                },
                                () => {
                                    UIkit.notification({message: 'Ошибка сохранения', status: 'danger'})
                                })}>Опубликовать</button>
                        </p>
                    </div>
                </div>
            </>
        )
    }
}