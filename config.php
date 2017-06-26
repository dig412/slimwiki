<?php
use Slim\Container;
use League\Flysystem\Filesystem;
use League\Flysystem\Adapter\Local;

$container = new Container();
$container["settings"]["displayErrorDetails"] = true;
$container["settings"]["libraryPath"] = __DIR__ . '/library';
$container["settings"]["uploadPath"] = __DIR__ . '/public/uploads';

$container['library'] = function($container)
{
	$adapter = new Local($container["settings"]["libraryPath"]);
	$filesystem = new Filesystem($adapter);
	$filesystem->addPlugin(new SlimWiki\ListTree);
	return $filesystem;
};
$container['uploads'] = function($container)
{
	$adapter  = new Local($container["settings"]["uploadPath"]);
	$filesystem = new Filesystem($adapter);
	$filesystem->addPlugin(new SlimWiki\ListTree);
	return $filesystem;
};
$container['markdown'] = function($container)
{
	$markdown = new SlimWiki\ParsedownLinkTarget($adapter);
	return $markdown;
};

return $container;