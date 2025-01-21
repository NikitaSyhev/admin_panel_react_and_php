import $ from 'jquery';

$.get("./api/index.php", data => {
        data.forEach(file=> {
            $("body").append(`<h1>${file}</h1>`)
        })
}, "JSON");



