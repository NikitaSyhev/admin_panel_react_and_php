
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
        this.iframe.load(this.currentPage, ()=> {   
            console.log(this.currentPage);
        });
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
