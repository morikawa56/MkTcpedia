<?php
# WARNING: This file is publicly viewable on the web. Do not put private data here.
	$wgLBFactoryConf = [

		# Requires 'sectionsByDB', 'sectionLoads', 'serverTemplate'

		'class' => 'LBFactoryMulti',

		# Everyone to DEFAULT
		'sectionsByDB' => [],

		'sectionLoads' => [
			'DEFAULT' => [
				'172.26.197.8' => 0,
			],
		],

		'serverTemplate' => [
			'dbname'	  => $wgDBname,
			'user'		  => $wgDBuser,
			'password'	  => $wgDBpassword,
			'type'		  => 'mysql',
			'flags'		  => DBO_DEFAULT,
			'max lag'	  => 300, // 5 minutes
			'useGTIDs'    => true,
		],

		'hostsByName' => [
			'172.26.197.8' => '172.26.197.8:3306', # deployment-db05.eqiad.wmflabs, master
		],

	];


	# No parser cache in beta yet
	$wmgParserCacheDBs = [];

