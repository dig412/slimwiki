<?php
namespace SlimWiki;

use Parsedown;

/**
 * Adds "target=_blank" to any urls or links that have a host component - i.e. they point to another site
 */
class ParsedownExtensions extends Parsedown
{
	protected function applyLinkTarget(&$link)
	{
		$urlComponents = parse_url($link["href"]);

		if(isset($urlComponents["host"])) {
			$link['target'] = "_blank";			
		}
	}

	protected function inlineLink($Excerpt)
	{
		$temp = parent::inlineLink($Excerpt);
		if(is_array($temp)) {
			if(isset($temp['element']['attributes']['href'])) {
				$this->applyLinkTarget($temp['element']['attributes']);
			}
			return $temp;
		}
	}

	protected function inlineUrl($Excerpt)
	{
		$temp = parent::inlineUrl($Excerpt);
		if(is_array($temp)) {
			if(isset($temp['element']['attributes']['href'])) {
				$this->applyLinkTarget($temp['element']['attributes']);
			}
			return $temp;
		}
	}

	protected function blockTable($Line, array $Block = null)
	{
		$Block = parent::blockTable($Line, $Block);

		if(is_array($Block)) {
			$Block['element']['attributes'] = [];
			$Block['element']['attributes']['class'] = 'table table-striped table-bordered';
		}

		return $Block;
	}
}