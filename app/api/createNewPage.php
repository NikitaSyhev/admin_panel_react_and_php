
<?php

session_start();
if ($_SESSION["auth"] != true) {
    header("HTTP/1.0 403 Forbidden");
    die;
}

//преобразовывает входящие данные из JSON в массив
$_POST = json_decode(file_get_contents("php://input"), true);
if (isset($_POST["name"]) && preg_match('/^[a-zA-Z0-9-_]+$/', $_POST["name"])) {
    $newFile = "../../" . $_POST["name"] . ".html";

    if (file_exists($newFile)) {
        header("HTTP/1.0 400 Bad Request");
        echo "Файл уже существует.";
    } else {
        $handle = fopen($newFile, "w");
        if ($handle) {
            
            fclose($handle); 
            echo "Файл успешно создан.";
        } else {
            header("HTTP/1.0 500 Internal Server Error");
            echo "Не удалось создать файл.";
        }
    }
} else {
    header("HTTP/1.0 400 Bad Request");
    echo "Некорректное имя файла.";
}

