import $ from 'jquery';


//функция для для отправки get запросов, чтобы отображать их на странице
function getPageList() {
    $("h1").remove();
    $.get("./api/index.php", data => {
        data.forEach(file=> {
            $("body").append(`<h1>${file}</h1>`)
        })
}, "JSON");
}

getPageList();





$("button").on("click", () => {
    $.post("./api/createNewPage.php", {
        "name": $("input").val()
    }, () => {
        getPageList();
    })
    .fail((jqXHR, textStatus, errorThrown) => {
        console.error("Ошибка при выполнении запроса:", textStatus, errorThrown);
    });
});




