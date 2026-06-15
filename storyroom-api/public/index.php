<?php

define('ROOT_PATH', dirname(__DIR__));

require ROOT_PATH . '/vendor/autoload.php';

use StoryRoom\Core\Database;
use StoryRoom\Core\Request;
use StoryRoom\Core\Response;
use StoryRoom\Core\Router;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $router = new Router();
    $request = Request::createFromGlobals();
    $response = $router->dispatch($request);
    $response->send();
} catch (\Exception $e) {
    Response::error($e->getMessage(), 500)->send();
}
