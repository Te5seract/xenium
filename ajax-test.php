<?php
if (isset($_POST["package1"])) {
    // echo json_encode([
    //     "success" => true,
    //     "content" => "some shit"
    // ]);
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

// echo json_encode([
//     "test1" => 1,
//     "test2" => "a"
// ]);
