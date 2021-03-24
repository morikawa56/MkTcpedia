<?php   
//在上传界面增加三个字段

if (!defined('MEDIAWIKI')) {
	exit;
}

$wgExtensionCredits['specialpage'][] = array(
	'path'           => __FILE__,
	'name'           => 'MoeUpload',
	'descriptionmsg' => 'moemoeQdec',
	'author'         => array('March','nybux.tsui','XpAhH','baskice','dreamnong',"AnnAngela"),
	'url'            => 'https://github.com/moegirlwiki/MoeUpload',
	'version'        => '1.2.1'
);

$wgExtensionMessagesFiles['moemoeQ'] = dirname(__FILE__).'/'. 'MoeUpload.i18n.php';

$wgHooks['UploadFormInitDescriptor'][] = 'onUploadFormInitDescriptor';
$wgHooks['UploadForm:BeforeProcessing'][] = 'BeforeProcessing';

$wgResourceModules['ext.MoeUpload'] = array(
	// JavaScript and CSS styles. To combine multiple files, just list them as an array.
	'scripts' => array( 'MoeUpload.js' ),
	'styles' => 'MoeUpload.css',
 
 
	// You need to declare the base path of the file paths in 'scripts' and 'styles'
	'localBasePath' => __DIR__,
	// ... and the base from the browser as well. For extensions this is made easy,
	// you can use the 'remoteExtPath' property to declare it relative to where the wiki
	// has $wgExtensionAssetsPath configured:
	'remoteExtPath' => 'MoeUpload'
);


$wgHooks['UploadForm:initial'][] = 'MoeUploadUploadForminitial';


function MoeUploadUploadForminitial ( $outputPage ) {
global $wgOut;
$wgOut -> addModules( 'ext.MoeUpload' );
return true;
}

function onBeforePageDisplay( &$out, &$skin ) {
	global $wgScriptPath;
	$path = "$wgScriptPath/extensions/MoeUpload/MoeUpload.js";
	$out->addScriptFile( $path );
	return true;
}

function onUploadFormInitDescriptor( &$descriptor ) { 
	$descriptor += array(
		'CharName' => array(
			'type' => 'text',
			'section' => 'description',
			'id' => 'wpCharName',
			'label-message' => 'moemoeQCharName',
			'size' => 60,
			//'default' => $this->mCharName,
		),
		'Author' => array(
			'type' => 'text',
			'section' => 'description',
			'id' => 'wpAuthor',
			'label-message' => 'moemoeQAuthor',
			'size' => 60,
			//'default' => $this->mAuthor,
		),
		'SrcUrl' => array(
			'type' => 'text',
			'section' => 'description',
			'id' => 'wpSrcUrl',
			'label-message' => 'moemoeQSrcUrl',
			'size' => 60,
			//'default' => $this->mSrcUrl,
		)
	);
	return true;
}

function BeforeProcessing( &$uploadFormObj ) {
	if( $uploadFormObj->mRequest->getFileName( 'wpUploadFile' ) !== null || $uploadFormObj->mRequest->getFileName( 'wpUploadFileURL' ) !== null) {
	  $uploadFormObj->mAuthor            = $uploadFormObj->mRequest->getText( 'wpAuthor' );
	  $uploadFormObj->mSrcUrl            = $uploadFormObj->mRequest->getText( 'wpSrcUrl' );
	  $uploadFormObj->mCharName          = $uploadFormObj->mRequest->getText( 'wpCharName' );
	  $uploadFormObj->mUploadDescription = $uploadFormObj->mRequest->getText('wpUploadDescription');
	  $suffix = "";
	  if ($uploadFormObj->mUploadDescription != "" && $uploadFormObj->mComment == "") {
	      if ($uploadFormObj->mSrcUrl != "") {
	          $suffix .= " ";
	      }
	      $suffix .= $uploadFormObj->mUploadDescription;
	  }

	  foreach (explode(" ", $uploadFormObj->mAuthor) as $author) {
	      if ($author != "") {
	          $uploadFormObj->mComment .= "[[分类:作者:$author]]";
	      }
	  }

	  foreach (explode(" ", $uploadFormObj->mCharName) as $catagory) {
	      if ($catagory != "") {
	          $uploadFormObj->mComment .= "[[分类:$catagory]]";
	      }
	  }
	  if ($uploadFormObj->mSrcUrl != "") {
	      $uploadFormObj->mComment .= "源地址:".$uploadFormObj->mSrcUrl;
	  }
	  $uploadFormObj->mComment .= $suffix;
	}

	return $uploadFormObj;
}

?>
