<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use League\Flysystem\Filesystem;
use League\Flysystem\Adapter\Local;

include __DIR__ . "/../vendor/autoload.php";
include __DIR__ . "/../src/ListTree.php";

$config = [
	'settings' => [
		'displayErrorDetails' => true,
	],
];

$app = new \Slim\App($config);

$container = $app->getContainer();
$container['filesystem'] = function ($container) {
	$adapter    = new Local(__DIR__.'/../library');
	$filesystem = new Filesystem($adapter);
	$filesystem->addPlugin(new ListTree);
	return $filesystem;
};
$container['markdown'] = function ($container) {
	$markdown = new \Parsedown($adapter);
	return $markdown;
};
$container['view'] = new \Slim\Views\PhpRenderer(__DIR__ . "/../templates/");

$app->get('/', function (Request $request, Response $response) {
	$response = $this->view->render($response, "index.phtml");
	return $response;
});

$app->get('/tree', function (Request $request, Response $response) {
	$filesystem = $this->get('filesystem');
	$files = $filesystem->listTree(".");

	$response = $response->withJson($files);

	return $response;
});

$app->get('/article/{article_path:.*}', function (Request $request, Response $response) {
	$filesystem = $this->get('filesystem');
	$markdown = $this->get('markdown');

	$path = $request->getAttribute('article_path');

	$source = $filesystem->read($path);
	$html = $markdown->text($source);

	$results = [
		"html" => $html,
		"source" => $source,
		"path" => $path
	];

	$response = $response->withJson($results);

	return $response;
});

$app->post('/article', function (Request $request, Response $response) {
	$filesystem = $this->get('filesystem');

	$path = $request->getParam('article_path');
	$source = $request->getParam('source');
	$result = $filesystem->put($path, $source);

	$results = [
		"success" => ($result !== false)
	];

	$response = $response->withJson($results);

	return $response;
});

$app->run();