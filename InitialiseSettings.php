<?php

$wgConf->settings = array(

'wgServer' => array(
    // if you want to allow also usage of https, just use '//localhost'
    // and set 'http://localhost' at 'wgCanonicalServer'
    'default' => '//主站域名',
),

'wgCanonicalServer' => array(
    'default' => 'http://主站域名',
),

'wgScriptPath' => array(
    'default' => '/$wiki',
),

'wgArticlePath' => array(
    'default' => '/$wiki/index.php/$1',

),

'wgSitename' => array(
    'wiki_kimisui56_w' => '主站名称',
    'wikifile_kimisui' => '共享站名称', // accent in French
),

'wgLanguageCode' => array(
    'default' => '$lang',
),

'wgLocalInterwiki' => array(
    'default' => '$lang',
),

);