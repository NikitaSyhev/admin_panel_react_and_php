

import "../helpers/iframeLoader.js";

import axios from 'axios';
import React, {Component} from 'react';
import DOMHelper from "../helpers/dom-helper.js";
import EditorText from "../editor-text/";
import UIkit from "uikit";
import Spinner from "../spinner/spinner.js";
import ConfirmModal from "../confirm-modal/confirm-modal.js";
import ChooseModal from "../choose-modal/choose-modal.js";
import EditorMeta from "../editor-meta/editor-meta.js";



export default class Editor extends Component {
    constructor() {
        super();
        this.currentPage = "index.html";
        this.state = {
            pageList: [],
            backupsList: [],
            newPageName: "",
            loading: true,
        }
      
        this.isLoading = this.isLoading.bind(this);
        this.isLoaded = this.isLoaded.bind(this);
        this.save = this.save.bind(this);
        this.init = this.init.bind(this);
        this.restoreBackup = this.restoreBackup.bind(this);
      
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
        this.loadBackupsList();
    }

    //метод open для открытия страницы
    open(page, cb) {
        this.currentPage = page;

        axios
            .get(`../${page}?rnd=${Math.random()}`)
            .then(res => DOMHelper.parseStrToDOM(res.data))
            .then(DOMHelper.wrapTextNodes)
            .then(DOMHelper.wrapImages)
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

            this.loadBackupsList();
    }
    //сохранение страницы на сервер
    async save(onSuccess, onError) {
        this.isLoading();
        const newDom = this.virtualDom.cloneNode(this.virtualDom);
        DOMHelper.unwrapTextNodes(newDom);
        DOMHelper.unwwrapImages(newDom);
        const html = DOMHelper.serializeDOMToString(newDom);
        await axios
            .post("./api/savePage.php", {pageName: this.currentPage, html})
            .then(onSuccess)
            .catch(onError)
            .finally(this.isLoaded);

        this.loadBackupsList();
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

    //метод для создания списка бекапов
    loadBackupsList() {
        axios
            .get("./backups/backups.json")
            .then(res => this.setState({backupsList: res.data.filter(backup => {
                return backup.page === this.currentPage;
            })
        }))
    }

    //метод восстановления резервной копии
    restoreBackup(e, backup) {
        console.log("Вызов метода restoreBackup, backup:", backup);
        if (e) {
            e.preventDefault();
        }
        
        UIkit.modal.confirm("Вы действительно хотите восстановить страницу из этой резервной копии? Все несохраненные данные будут потеряны!", {labels: {ok: 'Восстановить', cancel: 'Отмена'}})
        .then(() => {
            this.isLoading();
            return axios
                .post('./api/restoreBackup.php', {"page": this.currentPage, "file": backup})
        })
        .then(() => {
            this.open(this.currentPage, this.isLoaded);
        })
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
        const {loading, pageList, backupsList} = this.state;
        const modal = true;
        let spinner;

        // console.log(backupsList);
        
        loading ? spinner = <Spinner active/> : spinner = <Spinner />

        //где то теряется контекст в методе save
         //onClick - я поставл этот метод, так как в модальном окне почему то не отрабатывает Клик

        return (
            <>
                 <iframe src="" frameBorder="0"></iframe>
                
                {spinner}
               
                <div className="panel">
                    <button className="uk-button uk-button-primary uk-margin-small-right" uk-toggle="target: #modal-open">Открыть</button>
                    <button className="uk-button uk-button-primary uk-margin-small-right" uk-toggle="target: #modal-meta">Редактировать МЕТА</button>
                    <button className="uk-button uk-button-primary uk-margin-small-right" uk-toggle="target: #modal-save" onClick={() => this.save()}>Опубликовать</button>
                    <button className="uk-button uk-button-default" uk-toggle="target: #modal-backup">Восстановить</button>
                </div>
                
                <ConfirmModal modal={modal}  target={'modal-save'} method={this.save}/>
                <ChooseModal modal={modal}  target={'modal-open'} data={pageList} redirect={this.init}/>
                <ChooseModal modal={modal}  target={'modal-backup'} data={backupsList} redirect={this.restoreBackup}/>
                {this.virtualDom ?  <EditorMeta modal={modal}  target={'modal-meta'} virtualDom={this.virtualDom}/> : false}
            </>
        )
    }
}