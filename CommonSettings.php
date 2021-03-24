<?php
$wgEnableEmail = true;
$wgEnableUserEmail = true; # UPO

$wgSMTP = array(
	'host'     => "",
	'IDHost'   => "",
	'port'     => ,
	'auth'     => ,
	'username' => "",
	'password' => ""
   ); 
$wgEmergencyContact = "";
$wgPasswordSender = "";
$wgPasswordSenderName = '';
$wgEnotifUserTalk = true; # UPO
$wgEnotifWatchlist = true; # UPO
$wgEmailAuthentication = true;
$wgEmailConfirmToEdit = true;


$wgDBprefix = "";

## Shared memory settings
$wgMainCacheType = CACHE_MEMCACHED;
$wgMemCachedServers = [ '127.0.0.1:11211' ];

## To enable image uploads, make sure the 'images' directory
## is writable, then set this to true:

$wgUseImageMagick = true;
$wgImageMagickConvertCommand = "/usr/bin/convert";

# InstantCommons allows wiki to use images from https://commons.wikimedia.org
$wgUseInstantCommons = true;

# Periodically send a pingback to https://www.mediawiki.org/ with basic data
# about this MediaWiki instance. The Wikimedia Foundation shares this data
# with MediaWiki developers to help guide future development efforts.
$wgPingback = true;

## If you use ImageMagick (or any other shell command) on a
## Linux server, this will need to be set to the name of an
## available UTF-8 locale
$wgShellLocale = "en_US.utf8";

## Set $wgCacheDirectory to a writable directory on the web server
## to make your wiki go slightly faster. The directory should not
## be publically accessible from the web.
#$wgCacheDirectory = "$IP/cache";

# Site language code, should be one of the list in ./languages/data/Names.php
$wgLanguageCode = "zh";

$wgSecretKey = "71143dcf162cb2285fc55fb0f6a2953b596828aaf3d198b30c601b21c87239bd";

# Changing this will log out all existing sessions.
$wgAuthenticationTokenVersion = "1";

# Site upgrade key. Must be set to a string (default provided) to turn on the
# web installer while LocalSettings.php is in place
$wgUpgradeKey = "de0707e7eb714310";

## For attaching licensing metadata to pages, and displaying an
## appropriate copyright notice / icon. GNU Free Documentation
## License and Creative Commons licenses are supported so far.
$wgRightsPage = ""; # Set to the title of a wiki page that describes your license/copyright
$wgRightsUrl = "https://creativecommons.org/licenses/by-nc-sa/4.0/";
$wgRightsText = "知识共享署名-非商业性使用-相同方式共享 4.0";
$wgRightsIcon = "$wgResourceBasePath/resources/assets/licenses/cc-by-nc-sa.png";
unset ($wgFooterIcons['poweredby']['mediawiki']);

# Path to the GNU diff3 utility. Used for conflict resolution.
$wgDiff3 = "/usr/bin/diff3";

# The following permissions were set based on your choice in the installer
$wgGroupPermissions['*']['createaccount'] = true;
$wgGroupPermissions['*']['edit'] = false;

## Default skin: you can change the default skin. Use the internal symbolic
## names, ie 'vector', 'monobook':
$wgDefaultSkin = "vector";

# Enabled skins.
# The following skins were automatically enabled:
wfLoadSkin( 'Vector' );



# Enabled extensions. Most of the extensions are enabled by adding
# wfLoadExtensions('ExtensionName');
# to LocalSettings.php. Check specific extension documentation for more details.
# The following extensions were automatically enabled:
require_once( "$IP/AvatarSettings.php" );
wfLoadExtension( 'CategoryTree' );
wfLoadExtension( 'Cite' );
wfLoadExtension( 'CiteThisPage' );
wfLoadExtension( 'CodeEditor' );
wfLoadExtension( 'ConfirmEdit' );
wfLoadExtension( 'Gadgets' );
wfLoadExtension( 'ImageMap' );
wfLoadExtension( 'InputBox' );
wfLoadExtension( 'Interwiki' );
wfLoadExtension( 'MultimediaViewer' );
wfLoadExtension( 'Nuke' );
wfLoadExtension( 'Poem' );
wfLoadExtension( 'Renameuser' );
wfLoadExtension( 'ReplaceText' );
wfLoadExtension( 'Scribunto' );
wfLoadExtension( 'SpamBlacklist' );
wfLoadExtension( 'TemplateSandbox' );
wfLoadExtension( 'TitleBlacklist' );
wfLoadExtension( 'WikiEditor' );

# End of automatically generated settings.
# Add more configuration options below.

$wgShowExceptionDetails = true;

wfLoadExtension( 'ParserFunctions' );
require_once( "$IP/extensions/RegexParserFunctions/RegexParserFunctions.php" );
$wgPFEnableStringFunctions = true;

require_once( "$IP/extensions/Widgets/Widgets.php" );
wfLoadExtension( 'CheckUser' );
wfLoadExtension( 'DeleteBatch' );
wfLoadExtension( 'Echo' );
wfLoadExtension( 'FlowThread' );
wfLoadExtension( 'UserMerge' );
wfLoadExtension( 'AJAXPoll' );
wfLoadExtension( 'CharInsert' );
wfLoadExtension( 'TemplateStyles' );
wfLoadExtension( 'intersection' );
wfLoadExtension( 'RandomSelection' );
wfLoadExtension( 'Sm2Shim' );
wfLoadExtension( 'Variables' );
wfLoadExtension( 'NativeSvgHandler' );
wfLoadExtension( 'AbuseFilter' );
wfLoadExtension( 'AntiSpoof' );
wfLoadExtension( 'Disambiguator' );
wfLoadExtension( 'GlobalBlocking' );
wfLoadExtension( 'TextExtracts' );
wfLoadExtension( 'PageImages' );
wfLoadExtension( 'RevisionSlider' );
wfLoadExtension( 'Thanks' );
wfLoadExtension( 'WikiLove' );
# wfLoadExtension( 'MmixCaptcha' );


wfLoadExtension( 'Popups' );
$wgPopupsHideOptInOnPreferencesPage = true;
$wgPopupsOptInDefaultState = '1';
$wgPopupsReferencePreviewsBetaFeature = false;


wfLoadExtension( 'PinyinSort' ); 
$wgCategoryCollation = 'pinyin';


wfLoadExtension( 'TimedMediaHandler' );
$wgFFmpegLocation = '/usr/bin/ffmpeg'; 
$wgEnableTranscode = true;

# MassEditRegex

require_once "$IP/extensions/MassEditRegex/MassEditRegex.php";

$wgMFDefaultSkinClass = "SkinMinerva";

require_once( "$IP/extensions/ContributionScores/ContributionScores.php" );
$wgContribScoreIgnoreBots = true;          // Exclude Bots from the reporting - Can be omitted.
$wgContribScoreIgnoreBlockedUsers = true;  // Exclude Blocked Users from the reporting - Can be omitted.
$wgContribScoresUseRealName = true;        // Use real user names when available - Can be omitted. Only for MediaWiki 1.19 and later.
$wgContribScoreDisableCache = false;       // Set to true to disable cache for parser function and inclusion of table.

//Each array defines a report - 7,50 is "past 7 days" and "LIMIT 50" - Can be omitted.
$wgContribScoreReports = array(
    array(7,50),
    array(30,50),
	array(0,50));
	
$wgGroupPermissions['masseditregexeditor']['masseditregex'] = true;
$wgGroupPermissions['sysop']['passwordreset'] = true;
$wgGroupPermissions['sysop']['ajaxpoll-view-results-before-vote'] = true;
$wgGroupPermissions['sysop']['interwiki'] = true;
$wgGroupPermissions['sysop']['patrolleredit'] = true;
$wgAddGroups['sysop'][] = 'patroller';
$wgAddGroups['sysop'][] = 'goodeditor';
$wgRemoveGroups['sysop'][] = 'goodeditor';
$wgGroupPermissions['bureaucrat']['deletebatch'] = true;
$wgGroupPermissions['bureaucrat']['usermerge'] = true;
$wgGroupPermissions['sysop']['abusefilter-modify'] = true;
$wgGroupPermissions['*']['abusefilter-log-detail'] = true;
$wgGroupPermissions['*']['abusefilter-view'] = true;
$wgGroupPermissions['*']['abusefilter-log'] = true;
$wgGroupPermissions['*']['createaccount'] = true;
$wgGroupPermissions['*']['createtalk'] = false;
$wgGroupPermissions['*']['comment'] = false;
$wgGroupPermissions['*']['createpage'] = false;
$wgGroupPermissions['*']['oathauth-enable'] = false;
$wgGroupPermissions['*']['ajaxpoll-vote'] = true;
$wgGroupPermissions['*']['ajaxpoll-view-results'] = true;
$wgGroupPermissions['sysop']['abusefilter-modify-restricted'] = true;
$wgGroupPermissions['sysop']['abusefilter-revert'] = true;
$wgGroupPermissions['goodeditor']['autopatrol'] = true;
$wgGroupPermissions['patroller']['noratelimit'] = true;
$wgGroupPermissions['patroller']['commentadmin-restricted'] = true;
$wgGroupPermissions['patroller']['rollback'] = true;
$wgGroupPermissions['patroller']['skipcaptcha'] = true;
$wgGroupPermissions['patroller']['patrol'] = true;
$wgGroupPermissions['patroller']['patrolleredit'] = true;
$wgGroupPermissions['patroller']['block'] = true;
$wgAddGroups['patroller'][] = 'goodeditor';
$wgRemoveGroups['patroller'][] = 'goodeditor';
$wgGroupPermissions['autoconfirmed']['upload_by_url'] = true;
$wgGroupPermissions['autoconfirmed']['skipcaptcha'] = true;
$wgGroupPermissions['autoconfirmed']['move-categorypages'] = true;
$wgGroupPermissions['autoconfirmed']['movefile'] = true;
$wgGroupPermissions['autoconfirmed']['move-rootuserpages'] = true;
$wgGroupPermissions['autoconfirmed']['move'] = true;
$wgGroupPermissions['autoconfirmed']['move-subpages'] = true;
$wgGroupPermissions['bot']['suppressredirect'] = false;
$wgGroupPermissions['developer']['upload'] = true;
$wgGroupPermissions['developer']['abusefilter-modify-restricted'] = true;
$wgGroupPermissions['developer']['abusefilter-modify'] = true;
$wgGroupPermissions['developer']['createtalk'] = true;
$wgGroupPermissions['developer']['createpage'] = true;
$wgGroupPermissions['developer']['editwidgets'] = true;
$wgGroupPermissions['developer']['abusefilter-revert'] = true;
$wgGroupPermissions['developer']['abusefilter-private'] = true;
$wgGroupPermissions['developer']['editinterface'] = true;
$wgGroupPermissions['developer']['edit'] = true;
$wgGroupPermissions['staff']['unblockself'] = true;
$wgGroupPermissions['suppress']['deletelogentry'] = true;
$wgGroupPermissions['suppress']['deleterevision'] = true;
$wgGroupPermissions['suppress']['hideuser'] = true;
$wgGroupPermissions['suppress']['suppressrevision'] = true;
$wgGroupPermissions['suppress']['suppressionlog'] = true;
$wgGroupPermissions['suppress']['commentadmin'] = true;
$wgGroupPermissions['user']['move-categorypages'] = false;
$wgGroupPermissions['user']['movefile'] = false;
$wgGroupPermissions['user']['move-rootuserpages'] = false;
$wgGroupPermissions['user']['move'] = false;
$wgGroupPermissions['user']['move-subpages'] = false;
$wgGroupPermissions['user']['reupload'] = false;
$wgGroupPermissions['user']['comment'] = true;
unset( $wgGroupPermissions['masseditregexeditor'] );
unset( $wgRevokePermissions['masseditregexeditor'] );
unset( $wgAddGroups['masseditregexeditor'] );
unset( $wgRemoveGroups['masseditregexeditor'] );
unset( $wgGroupsAddToSelf['masseditregexeditor'] );
unset( $wgGroupsRemoveFromSelf['masseditregexeditor'] );
$wgGroupPermissions['remover']['bigdelete'] = true;
$wgGroupPermissions['remover']['undelete'] = true;

# if you want to restrict the poll
# use the following code lines after calling the AJAXPoll extension
# to restrict to user group (example)

# The 'ajaxpoll-view-results-before-vote' group permission allows the specified
# group members to view poll results even without having voted
# but only if the high-level group permission 'ajaxpoll-vote' allows to view
# results in general.
#
# This 'ajaxpoll-view-results-before-vote' can be overwritten with the specific
# per-poll setting "show-results-before-voting" which takes precedence over the
# group permission.
#
# permission 'ajaxpoll-view-results' >>
# >> per-poll setting "show-results-before-voting" (if present)
# >> permission 'ajaxpoll-view-results-before-vote'

# anons
# default: anons cannot vote and will never see results
$wgGroupPermissions['*']['ajaxpoll-view-results-before-vote'] = false;

# users
# default: users can vote and can see poll results - when they have voted
$wgGroupPermissions['user']['ajaxpoll-vote'] = true;
$wgGroupPermissions['user']['ajaxpoll-view-results'] = true;

$wgFlowThreadConfig['Avatar'] = "$wgScriptPath/extensions/Avatar/avatar.php?user=" . '${username}' . "&res=128";
# SendGrid
# $wgSendGridAPIKey = "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";

$wgThanksLogging = true;
$wgThanksConfirmationRequired = true;
$wgThanksLogTypeWhitelist = [
	"contentmodel",
	"delete",
	"import",
	"merge",
	"move",
	"patrol",
	"protect",
	"tag",
	"managetags",
	"rights"
];

$wgAllowDisplayTitle = true;

// lua

$wgScribuntoDefaultEngine = 'luastandalone';

# elasticsearch

require_once( "$IP/extensions/CirrusSearch/CirrusSearch.php" );
require_once( "$IP/extensions/Elastica/Elastica.php" );
# wfLoadExtension( 'Elastica' );
# wfLoadExtension( 'CirrusSearch' );

$wgScribuntoUseGeSHi = true;
$wgScribuntoUseCodeEditor = true;

$wgCirrusSearchServers = array(
	'Elastica服务器ip', # search.svc.eqiad.wmnet
);

$wgShowDBErrorBacktrace = true;

# Loops
wfLoadExtension( 'Loops' );
/* ExtLoops::$maxLoops = 100;
$egLoopsEnabledFunctions = array_diff(
    $egLoopsEnabledFunctions, [
        'forargs', 'fornumargs'
        ]
    );
*/


$wgFileExtensions = array( 'png', 'gif', 'jpg', 'jpeg', 'doc',
    'xls', 'mpp', 'pdf', 'ppt', 'tiff', 'bmp', 'docx', 'xlsx',
    'pptx', 'ps', 'odt', 'ods', 'odp', 'odg', 'svg', 'ogg', 'ogv', 'oga', 'flac', 'opus', 'wav', 'webm', 'mp3', 'webp', 'jp2', 'psd', 'sai', 'swf', 'ttf', 'mp4'
);

$wgFileBlacklist = array_diff( $wgFileBlacklist, array ('exe', 'sh', 'cmd', 'com') );

$wgAllowImageTag = true;
$wgAutoConfirmAge = 86400;
$wgAutoConfirmCount = 10;

$wgRestrictionLevels[] = 'patrolleredit';
$wgMediaViewerUseThumbnailGuessing = false;
$wgBlockedUserHelp = true;
$wgMemoryLimit = "512M";
$wgDisableOutputCompression  = true;
$wgAllowSiteCSSOnRestrictedPages = true;
$wgAllowUserCss = true;
$wgAllowUserJs = true;

require_once("$IP/LBsettings.php");

$wgMaxShellMemory = 1536000;

wfLoadExtension( 'GlobalUsage' );
$wgGlobalUsageDatabase = '共享站数据库名';
$wgSharedTables[] = 'sites'; 
$wgSharedPrefix = '';

$wgNamespaceAliases['U'] = NS_USER;
$wgNamespaceAliases['U_talk'] = NS_USER_TALK;
$wgNamespaceAliases['CAT'] = NS_CATEGORY;
$wgNamespaceAliases['CAT_talk'] = NS_CATEGORY_TALK;
$wgNamespaceAliases['MK'] = NS_PROJECT;
$wgNamespaceAliases['MK_talk'] = NS_PROJECT_TALK;

$wgCdnReboundPurgeDelay = 3;
$wgAllowExternalImages = true;