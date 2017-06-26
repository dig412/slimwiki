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