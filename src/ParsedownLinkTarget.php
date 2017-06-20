<?php
/**
 * Adds "target=_blank" to any urls or links that have a host component - i.e. they point to another site
 */
class ParsedownLinkTarget extends Parsedown
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
}