<?php
/**
 * Special page to show global file usage. Also contains hook functions for
 * showing usage on an image page.
 */

class SpecialGlobalUsage extends SpecialPage {
	/**
	 * @var Title
	 */
	protected $target;

	/**
	 * @var bool
	 */
	protected $filterLocal;

	public function __construct() {
		parent::__construct( 'GlobalUsage' );
	}

	/**
	 * Entry point
	 * @param string $par
	 */
	public function execute( $par ) {
		$target = $par ? $par : $this->getRequest()->getVal( 'target' );
		$this->target = Title::makeTitleSafe( NS_FILE, $target );

		$this->filterLocal = $this->getRequest()->getCheck( 'filterlocal' );

		$this->setHeaders();
		$this->getOutput()->addWikiMsg( 'globalusage-header' );
		if ( !is_null( $this->target ) ) {
			$this->getOutput()->addWikiMsg( 'globalusage-header-image', $this->target->getText() );
		}
		$this->showForm();

		if ( is_null( $this->target ) ) {
			$this->getOutput()->setPageTitle( $this->msg( 'globalusage' ) );
			return;
		}

		$this->getOutput()->setPageTitle(
			$this->msg( 'globalusage-for', $this->target->getPrefixedText() ) );

		$this->showResult();
	}

	/**
	 * Shows the search form
	 */
	private function showForm() {
		global $wgScript;

		$this->getOutput()->enableOOUI();
		/* Build form */
		$form = new OOUI\FormLayout( [
			'method' => 'get',
			'action' => $wgScript,
		] );

		$fields = [];
		$fields[] = new OOUI\FieldLayout(
			new OOUI\TextInputWidget( [
				'name' => 'target',
				'id' => 'target',
				'autosize' => true,
				'infusable' => true,
				'value' => is_null( $this->target ) ? '' : $this->target->getText(),
			] ),
			[
				'label' => $this->msg( 'globalusage-filename' )->text(),
				'align' => 'top',
			]
		);

		// Filter local checkbox
		$fields[] = new OOUI\FieldLayout(
			new OOUI\CheckboxInputWidget( [
				'name' => 'filterlocal',
				'id' => 'mw-filterlocal',
				'value' => '1',
				'selected' => $this->filterLocal,
			] ),
			[
				'align' => 'inline',
				'label' => $this->msg( 'globalusage-filterlocal' )->text(),
			]
		);

		// Submit button
		$fields[] = new OOUI\FieldLayout(
			new OOUI\ButtonInputWidget( [
				'value' => $this->msg( 'globalusage-ok' )->text(),
				'label' => $this->msg( 'globalusage-ok' )->text(),
				'flags' => [ 'primary', 'progressive' ],
				'type' => 'submit',
			] ),
			[
				'align' => 'top',
			]
		);

		$fieldset = new OOUI\FieldsetLayout( [
			'label' => $this->msg( 'globalusage-text' )->text(),
			'id' => 'globalusage-text',
			'items' => $fields,
		] );

		$form->appendContent(
			$fieldset,
			new OOUI\HtmlSnippet(
				Html::hidden( 'title', $this->getPageTitle()->getPrefixedText() )  .
				Html::hidden( 'limit', $this->getRequest()->getInt( 'limit', 50 ) )
			)
		);

		$this->getOutput()->addHTML(
			new OOUI\PanelLayout( [
				'expanded' => false,
				'padded' => true,
				'framed' => true,
				'content' => $form,
			] )
		);

		if ( !is_null( $this->target ) && wfFindFile( $this->target ) ) {
			// Show the image if it exists
			$html = Linker::makeThumbLinkObj(
				$this->target,
				wfFindFile( $this->target ),
				/* $label */ $this->target->getPrefixedText(),
				/* $alt */ '', /* $align */ $this->getLanguage()->alignEnd(),
				/* $handlerParams */ [], /* $framed */ false,
				/* $manualThumb */ false
			);
			$this->getOutput()->addHtml( $html );
		}
	}

	/**
	 * Creates as queryer and executes it based on $this->getRequest()
	 */
	private function showResult() {
		$query = new GlobalUsageQuery( $this->target );
		$request = $this->getRequest();

		// Extract params from $request.
		if ( $request->getText( 'from' ) ) {
			$query->setOffset( $request->getText( 'from' ) );
		} elseif ( $request->getText( 'to' ) ) {
			$query->setOffset( $request->getText( 'to' ), true );
		}
		$query->setLimit( $request->getInt( 'limit', 50 ) );
		$query->filterLocal( $this->filterLocal );

		// Perform query
		$query->execute();

		// Don't show form element if there is no data
		if ( $query->count() == 0 ) {
			$this->getOutput()->addWikiMsg( 'globalusage-no-results', $this->target->getPrefixedText() );
			return;
		}

		$navbar = $this->getNavBar( $query );
		$targetName = $this->target->getText();
		$out = $this->getOutput();

		// Top navbar
		$out->addHtml( $navbar );

		$out->addHtml( '<div id="mw-globalusage-result">' );
		foreach ( $query->getSingleImageResult() as $wiki => $result ) {
			$out->addHtml(
				'<h2>' . $this->msg(
					'globalusage-on-wiki',
					$targetName, WikiMap::getWikiName( $wiki ) )->parse()
					. "</h2><ul>\n" );
			foreach ( $result as $item ) {
				$out->addHtml( "\t<li>" . self::formatItem( $item ) . "</li>\n" );
			}
			$out->addHtml( "</ul>\n" );
		}
		$out->addHtml( '</div>' );

		// Bottom navbar
		$out->addHtml( $navbar );
	}

	/**
	 * Helper to format a specific item
	 * @param array $item
	 * @return String
	 */
	public static function formatItem( $item ) {
		if ( !$item['namespace'] ) {
			$page = $item['title'];
		} else {
			$page = "{$item['namespace']}:{$item['title']}";
		}

		$link = WikiMap::makeForeignLink( $item['wiki'], $page,
			str_replace( '_', ' ', htmlspecialchars( $page ) ) );
		// Return only the title if no link can be constructed
		return $link === false ? htmlspecialchars( $page ) : $link;
	}

	/**
	 * Helper function to create the navbar, stolen from wfViewPrevNext
	 *
	 * @param GlobalUsageQuery $query An executed GlobalUsageQuery object
	 * @return string Navbar HTML
	 */
	protected function getNavBar( $query ) {
		$target = $this->target->getText();
		$limit = $query->getLimit();

		# Find out which strings are for the prev and which for the next links
		$offset = $query->getOffsetString();
		$continue = $query->getContinueString();
		if ( $query->isReversed() ) {
			$from = $offset;
			$to = $continue;
		} else {
			$from = $continue;
			$to = $offset;
		}

		# Get prev/next link display text
		$prevMsg = $this->msg( 'prevn' )->numParams( $limit );
		$nextMsg = $this->msg( 'nextn' )->numParams( $limit );
		# Get prev/next link title text
		$pTitle = $this->msg( 'prevn-title' )->numParams( $limit )->escaped();
		$nTitle = $this->msg( 'nextn-title' )->numParams( $limit )->escaped();

		# Fetch the title object
		$title = $this->getPageTitle();
		$linkRenderer = $this->getLinkRenderer();

		# Make 'previous' link
		if ( $to ) {
			$attr = [ 'title' => $pTitle, 'class' => 'mw-prevlink' ];
			$q = [ 'limit' => $limit, 'to' => $to, 'target' => $target ];
			if ( $this->filterLocal ) {
				$q['filterlocal'] = '1';
			}
			$plink = $linkRenderer->makeLink( $title, $prevMsg->text(), $attr, $q );
		} else {
			$plink = $prevMsg->escaped();
		}

		# Make 'next' link
		if ( $from ) {
			$attr = [ 'title' => $nTitle, 'class' => 'mw-nextlink' ];
			$q = [ 'limit' => $limit, 'from' => $from, 'target' => $target ];
			if ( $this->filterLocal ) {
				$q['filterlocal'] = '1';
			}
			$nlink = $linkRenderer->makeLink( $title, $nextMsg->text(), $attr, $q );
		} else {
			$nlink = $nextMsg->escaped();
		}

		# Make links to set number of items per page
		$numLinks = [];
		$lang = $this->getLanguage();
		foreach ( [ 20, 50, 100, 250, 500 ] as $num ) {
			$fmtLimit = $lang->formatNum( $num );

			$q = [ 'offset' => $offset, 'limit' => $num, 'target' => $target ];
			if ( $this->filterLocal ) {
				$q['filterlocal'] = '1';
			}
			$lTitle = $this->msg( 'shown-title' )->numParams( $num )->escaped();
			$attr = [ 'title' => $lTitle, 'class' => 'mw-numlink' ];

			$numLinks[] = $linkRenderer->makeLink( $title, $fmtLimit, $attr, $q );
		}
		$nums = $lang->pipeList( $numLinks );

		return $this->msg( 'viewprevnext' )->rawParams( $plink, $nlink, $nums )->escaped();
	}

	protected function getGroupName() {
		return 'media';
	}
}
