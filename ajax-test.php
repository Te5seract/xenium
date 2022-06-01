<?php
    //header("Content-Type: application/json");
if (isset($_POST["package1"])) {
    echo json_encode([
        0 => [
            "test1" => 1,
            "test2" => "a"
        ],
        1 => [
            "test3" => 3,
            "test4" => "b"
        ]
    ]);
}

//echo "response";

if (isset($_POST["send-type"]) && $_POST["send-type"] === "file") {
    echo json_encode($_FILES);
}

if (isset($_GET["stuff"])) {
    echo json_encode([
        0 => [
            "test1" => 1,
            "test2" => "a"
        ],
        1 => [
            "test3" => 3,
            "test4" => "b"
        ]
    ]);
}
