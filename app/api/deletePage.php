<?php

$_POST = json_decode(file_get_contents("php://input"), true);

$file = "../../" . $_POST["name"];
//Этот код удаляет файл, имя которого передается в POST. Если файл не найден, он отвечает ошибкой 400
if(file_exists($file)) {
    //метод удаления файла
    unlink($file);
} else {
    header("HTTP/1.0 400 Bad Request");
}