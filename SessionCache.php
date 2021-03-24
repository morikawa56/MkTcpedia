<?php
$wgCookieDomain = '根域名';
$wgSessionName = "PHPSESSID";
$wgSessionsInObjectCache = true; // optional -- removed in 1.33+
$wgSessionCacheType = CACHE_MEMCACHED; // optional
$wgObjectCacheSessionExpiry = 300;
$wgCookieExpiration = 30 * 86400;
$wgObjectCaches[ CACHE_MEMCACHED ] = [ 'class' => MemcachedPhpBagOStuff::class, 'loggroup' => 'memcached' ];