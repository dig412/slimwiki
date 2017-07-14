<?php
namespace SlimWiki;

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

class Controller
{
	private $view;
	private $siteName;
	private $markdown;
	private $library;
	private $uploads;

	public function __construct(\Slim\Views\PhpRenderer $view, $siteName, \Parsedown $markdown, \League\Flysystem\Filesystem $library, \League\Flysystem\Filesystem $uploads)
	{
		$this->view = $view;
		$this->siteName = $siteName;
		$this->markdown = $markdown;
		$this->library = $library;
		$this->uploads = $uploads;
	}

	public function tree(Request $request, Response $response)
	{
		$files = $this->library->listTree(".");
		$response = $response->withJson($files);
		return $response;
	}

	public function uploads(Request $request, Response $response)
	{
		$files = $this->uploads->listTree(".");
		foreach($files as &$file) {
			$file["path"] = "uploads/" . $file["path"];
		}
		$response = $response->withJson($files);
		return $response;
	}

	public function getArticle(Request $request, Response $response)
	{
		$path = $request->getAttribute('article_path');

		if(!$this->library->has($path)) {
			$results = [
				"success" => false,
				"message" => "Article $path does not exist",
				"status"  => 404,
				"path"    => $path
			];

			$response = $response->withJson($results)->withStatus(404);
			return $response;
		}

		$source = $this->library->read($path);
		$html = $this->markdown->text($source);

		$results = [
			"html"   => $html,
			"source" => $source,
			"path"   => $path
		];

		$response = $response->withJson($results);

		return $response;
	}

	public function saveArticle(Request $request, Response $response)
	{
		$path = $request->getParam('article_path');
		$source = $request->getParam('source');
		$result = $this->library->put($path, $source);

		$results = [
			"success" => ($result !== false)
		];

		$response = $response->withJson($results);

		return $response;
	}

	public function search(Request $request, Response $response)
	{
		$query = $request->getAttribute('query');
		$contents = $this->library->listContents(".", true);

		$files = array_filter($contents, function($entry) {
			return $entry["type"] == "file";
		});

		$results = [];

		foreach($files as $file) {
			$document = $this->library->read($file["path"]);
			if(stripos($document, $query) !== false) {
				$results[] = $file["path"];
			}
		}

		$response = $response->withJson($results);

		return $response;
	}

	public function upload(Request $request, Response $response)
	{
		$files = $request->getUploadedFiles();

		$success = true;
		$message = "";

		foreach($files as $file) {
			$path = $file->getClientFilename();

			if($this->uploads->has($path)) {
				$success = false;
				$message = "File already exists at path $path";
				break;
			}

			$stream = fopen($file->file, 'r');
			$this->uploads->writeStream($path, $stream);
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
	}

	public function index(Request $request, Response $response)
	{
		$scriptDirectory = rtrim(str_replace("\\", "/", dirname($_SERVER['SCRIPT_NAME'])), "/");
		$response = $this->view->render($response, "index.phtml", [
			"root"     => $scriptDirectory,
			"siteName" => $this->siteName,
		]);
		return $response;
	}
}