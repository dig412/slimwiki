<?php
include __DIR__ . "/../vendor/autoload.php";

$container = include __DIR__ . "/../config.php";
$container['view'] = new \Slim\Views\PhpRenderer(__DIR__ . "/../templates/");

$app = new \Slim\App($container);

$container['Controller'] = function ($container) {
	$view = $container->get("view");
	$markdown = $container->get("markdown");
	$library = $container->get("library");
	$uploads = $container->get("uploads");
	return new SlimWiki\Controller($view, $markdown, $library, $uploads);
};

$app->get('/tree', "Controller:tree");
$app->get('/article/{article_path:.*}', "Controller:getArticle");
$app->post('/article', "Controller:saveArticle");
$app->get('/search/{query}', "Controller:search");
$app->post('/upload', "Controller:upload");
$app->get('/[{article_path:.*}]', "Controller:index");

$app->run();