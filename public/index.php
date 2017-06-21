<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use League\Flysystem\Filesystem;
use League\Flysystem\Adapter\Local;

include __DIR__ . "/../vendor/autoload.php";
include __DIR__ . "/../src/ListTree.php";
include __DIR__ . "/../src/ParsedownLinkTarget.php";

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
	$markdown = new \ParsedownLinkTarget($adapter);
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

	if(!$filesystem->has($path)) {
		$results = [
			"success" => false,
			"message" => "Article $path does not exist",
			"status"  => 404,
			"path"    => $path
		];

		$response = $response->withJson($results)->withStatus(404);
		return $response;
	}

	$source = $filesystem->read($path);
	$html = $markdown->text($source);

	$results = [
		"html"   => $html,
		"source" => $source,
		"path"   => $path
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

$app->get('/search/{query}', function (Request $request, Response $response) {
	$filesystem = $this->get('filesystem');

	$query = $request->getAttribute('query');
	$contents = $this->filesystem->listContents(".", true);

	$files = array_filter($contents, function($entry) {
        return $entry["type"] == "file";
    });

    $results = [];

    foreach($files as $file) {
    	$document = $filesystem->read($file["path"]);
    	if(stripos($document, $query) !== false) {
    		$results[] = $file["path"];
    	}
    }

	$response = $response->withJson($results);

	return $response;
});

$app->post('/upload', function (Request $request, Response $response) {
	$filesystem = $this->get('filesystem');

	$files = $request->getUploadedFiles();

	$success = true;
	$message = "";

	foreach($files as $file) {
		$path = 'uploads/'.$file->getClientFilename();

		if($filesystem->has($path)) {
			$success = false;
			$message = "File already exists at path $path";
			break;
		}

		$stream = fopen($file->file, 'r');
		$filesystem->writeStream($path, $stream);
		fclose($stream);
		$uploadedFiles[] = $path;
	}

	$results = [
		"success" => $success,
		"message" => $message
	];

	$response = $response->withJson($results);

	if(!$success) {
		$response = $response->withStatus(400);
	}

	return $response;
});


$app->run();