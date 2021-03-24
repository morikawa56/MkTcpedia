<?php
// 包含公共设置到每个wiki在这行之后

        switch ( $_SERVER['SERVER_NAME'] ) {
                case '主站域名':
                        require_once 'LocalSettings_wiki.php';
                        break;

                case '共享站域名':
                        require_once 'LocalSettings_wikifile.php';
                        break;


                default:
                        header( 'HTTP/1.1 404 Not Found' );
                        echo 'This wiki is not available. Check configuration.';
                        exit( 0 );
        }
if ( defined( 'MW_DB' ) ) {
    // Set $wikiId from the defined constant 'MW_DB' that is set by maintenance scripts.
    $wikiId = MW_DB;
} elseif (isset($_SERVER['SERVER_NAME']) && $_SERVER['SERVER_NAME'] == '主站域名') {
    // Add a value to the $wikiId variable for e.g. https://wiki1.example.org/
    $wikiId = 'wiki';
} elseif (isset($_SERVER['SERVER_NAME']) && $_SERVER['SERVER_NAME'] == '共享站域名') {
    // Add a value to the $wikiId variable for e.g. https://example.org/wiki2
    $wikiId = 'wikifile';
} else {
    // Fail gracefully if no value was set to the $wikiId variable, i.e. if no wiki was determined
    die( 'It was not possible to determine the wiki ID.' );
}

