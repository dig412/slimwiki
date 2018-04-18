# SlimWiki
A simple markdown web wiki tool, with a [TiddlyWiki](http://tiddlywiki.com/) style interface.

It's build using [Slim Framework](https://www.slimframework.com), with [Mithril JS](https://mithril.js.org/) and [SimpleMDE](https://simplemde.com/) for the interface.

I wanted something with TiddlyWiki's "short-article-with-ajax-loading" interface, which I find works really well for documentation. However TiddlyWiki is a bit of a pain to serve and share between users.

SlimWiki uses [Flysystem](https://flysystem.thephpleague.com/api/) as its storage backend, so by default just stores markdown files on disk. If you decide you don't want to use it any more, migration is as simple as taking your files somewhere else. Flysystem also allows easy cloud integration and sharing via its adaptors. You can configure the application to save both locally and to S3 / Dropbox / etc for backup, or to allow two instances to share contents.

## Installation
Download the latest release [from the releases page](https://github.com/dig412/slimwiki/releases), extract to a directory of your choice.

### Webserver Config
For Apache:
```
  <Directory "/var/www/slimwiki/public/">
    AllowOverride None
    Require all granted
    DirectoryIndex /slimwiki/public/index.php
    FallbackResource /slimwiki/public/index.php
  </Directory>
```

## Configuration
Open `config.php` in the root to change settings.

## Relication
To replicate / backup your content on a different system you can add a second adapter and use Flysystem's ReplicateAdapter to automatically
copy changes to your replica.

For example:

```
composer require league/flysystem-aws-s3-v3
composer require league/flysystem-replicate-adapter
```

Then change the `library` entry in `config.php` to the following:

```
$container['library'] = function($container)
{
	$client = S3Client::factory([
	    'region' => 'eu-west-1',
	    'version' => 'latest',
	    //'credentials'
	]);
	
	$source = new Local($container["settings"]["libraryPath"]);
	$replica = new AwsS3Adapter($client, 'my-s3-bucket', 'optional-path-prefix');
	$adapter = new ReplicateAdapter($source, $replica);
	$filesystem = new Filesystem($adapter);
	$filesystem->addPlugin(new SlimWiki\ListTree);
	return $filesystem;
};
```

This will use the local copy for any read operations, but duplicate any writes to the local filesystem and S3.

## Development
Clone the repo, then run

```
composer install
npm install
```

If you want to make changes to the CSS or JS, run
```
npm watch
```