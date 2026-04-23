<?php
header("Content-Type: application/json");
$testFile = __DIR__ . '/test_write.txt';
$written = file_put_contents($testFile, "Test write at " . date('Y-m-d H:i:s'));

echo json_encode([
    "success" => true,
    "message" => "PHP is working",
    "write_attempt" => $written !== false ? "success" : "failed",
    "dir" => __DIR__,
    "user" => get_current_user(),
    "permissions" => substr(sprintf('%o', fileperms(__DIR__)), -4)
]);
