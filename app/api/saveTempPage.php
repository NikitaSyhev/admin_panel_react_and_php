<?php


//преобразовывает входящие данные из JSON в массив
    $_POST = json_decode(file_get_contents("php://input"), true);
//задаем рандомное сочетание чтобы временная ( техническая ) страница создавалась с рандомным названием и не задубливалась
    $newFile = "../../sjdnkjdsgn124234jdksnfksjn.html";

    if ($_POST["html"]) {
       file_put_contents($newFile, $_POST["html"]);
    } else {
        header("HTTP/1.0 400 Bad Request");
    }
