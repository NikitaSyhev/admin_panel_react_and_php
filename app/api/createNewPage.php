
<?php

if (isset($_POST["name"]) && preg_match('/^[a-zA-Z0-9-_]+$/', $_POST["name"])) {
    $newFile = "../../" . $_POST["name"] . ".html";

    if (file_exists($newFile)) {
        header("HTTP/1.0 400 Bad Request");
        echo "Файл уже существует.";
    } else {
        $handle = fopen($newFile, "w");
        if ($handle) {
            // Здесь можно записывать данные в файл
            fclose($handle); // Закрываем файл
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

