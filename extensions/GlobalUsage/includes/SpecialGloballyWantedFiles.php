<?php
/**
 * Implements Special:GloballyWantedFiles, the global equivalent to
 * Special:WantedFiles
 *
 * @file
 * @author Brian Wolff <bawolff+wn@gmail.com>
 * @ingroup SpecialPage
 */
class SpecialGloballyWantedFiles extends WantedFilesPage {

	function __construct( $name = 'GloballyWantedFiles' ) {
		return parent::__construct( $name );
	}

	/**
	 * Main execution function. Use the parent if we're on the right wiki.
	 * If we're not on a shared repo, try to redirect there.
	 * @param string $par
	 */
	function execute( $par ) {
		if ( GlobalUsage::onSharedRepo() ) {
			parent::execute( $par );
		} else {
			GlobalUsage::redirectSpecialPageToSharedRepo( $this->getContext() );
		}
	}

	/**
	 * Output an extra header
	 *
	 * @return String html to output
	 */
	function getPageHeader() {
		if ( RepoGroup::singleton()->hasForeignRepos() ) {
			return $this->msg( 'globallywantedfiles-foreign-repo' )->parseAsBlock();
		} else {
			// Use grandparent behaviour. Parent adds a message
			// about the tracking category which doesn't make sense here.
			return WantedQueryPage::getPageHeader();
		}
	}

	/**
	 * Don't want to do cached handling on non-shared repo, since we only redirect.
	 *
	 * Also make sure that GlobalUsage db same as shared repo.
	 * (To catch the unlikely case where GlobalUsage db is different db from the
	 * shared repo db).
	 * @return bool
	 */
	function isCacheable() {
		global $wgGlobalUsageDatabase;
		return GlobalUsage::onSharedRepo()
			&& ( !$wgGlobalUsageDatabase || $wgGlobalUsageDatabase === wfWikiID() );
	}

	/**
	 * Only list this special page on the wiki that is the shared repo.
	 *
	 * @return bool Should this be listed in Special:SpecialPages
	 */
	function isListed() {
		return GlobalUsage::onSharedRepo();
	}

	function getQueryInfo() {
		return GlobalUsage::getWantedFilesQueryInfo();
	}

	/**
	 * Format a row of the results
	 *
	 * We need to override this in order to link to Special:GlobalUsage
	 * instead of Special:WhatLinksHere.
	 *
	 * @param Skin $skin
	 * @param stdClass $result A row from the database
	 * @return String HTML to output
	 */
	public function formatResult( $skin, $result ) {
		// If some of the client wikis are $wgCapitalLinks = false
		// but the shared repo is not, then we will get some false positives
		// here. To avoid as much confusion as possible, use the raw (lowercase) version
		// of the title for displaying, but the safe (properly cased) version of
		// the title for any checks. (Bug 71359)
		$title = Title::makeTitle( $result->namespace, $result->title );
		$safeTitle = Title::makeTitleSafe( $result->namespace, $result->title );
		if ( $title instanceof Title && $safeTitle instanceof Title ) {
			$linkRenderer = $this->getLinkRenderer();
			$pageLink = $linkRenderer->makeLink( $title );
			if ( $safeTitle->isKnown() && wfFindFile( $safeTitle ) ) {
				// If the title exists and is a file, than strike.
				// The wfFindFile() call should already be cached from LinkRenderer::makeLink call
				// so it shouldn't be too expensive. However a future @todo would be
				// to do preload existence checks for files all at once via RepoGroup::findFiles.
				$pageLink = Html::rawElement( 'del', [], $pageLink );
			}

			$gu = SpecialPage::getTitleFor( 'GlobalUsage', $title->getDBKey() );
			$label = $this->msg( 'nlinks' )->numParams( $result->value )->text();
			$usages = $linkRenderer->makeLink( $gu, $label );

			return $this->getLanguage()->specialList( $pageLink, $usages );
		} else {
			return $this->msg( 'wantedpages-badtitle', $result->title )->escaped();
		}
	}
}
