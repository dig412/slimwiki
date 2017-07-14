<?php
include __DIR__ . "/../vendor/autoload.php";

$container = include __DIR__ . "/../config.php";
$container['view'] = new \Slim\Views\PhpRenderer(__DIR__ . "/../templates/");

$app = new \Slim\App($container);

$container['Controller'] = function ($container) {
	$siteName = $container["settings"]["siteName"];
	$view     = $container["view"];
	$markdown = $container["markdown"];
	$library  = $container["library"];
	$uploads  = $container["uploads"];
	return new SlimWiki\Controller($view, $siteName, $markdown, $library, $uploads);
};

$app->get('/tree', "Controller:tree");
$app->get('/getUploads', "Controller:uploads");
$app->get('/article/{article_path:.*}', "Controller:getArticle");
$app->post('/article', "Controller:saveArticle");
$app->get('/search/{query}', "Controller:search");
$app->post('/upload', "Controller:upload");
$app->get('/[{article_path:.*}]', "Controller:index");

$app->run();