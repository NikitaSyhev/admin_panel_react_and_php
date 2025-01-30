import axios from "axios";
import React, {Component} from "react";

export default class Editor extends Component {
    constructor() {
        super();

        this.state = {
            pageList: [],
            newPageName: "",
        }

        this.createNewPage  = this.createNewPage.bind(this);
    }

    //метод для того, чтобы запрос на сервер осуществлялся после того, как страница отрендерилась
    componentDidMount() {
        this.loadPageList();
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


    render() {
        const {pageList} = this.state;
        const pages = pageList.map((page, i) => {
            return (
                <h1 key={i}>{page}</h1>
            )
        });
        return (
            <>
                <input
                 onChange={(e) => {this.setState({newPageName: e.target.value})}}
                  type="text"></input>
                <button onClick={this.createNewPage}>Создать страницу</button>
                {pages}
            </>
        )
    }
}