<?php
/**
 * Re-queue selected, or all, transcodes
 */
$IP = getenv( 'MW_INSTALL_PATH' );
if ( $IP === false ) {
	$IP = __DIR__ . '/../../..';
}
require_once "$IP/maintenance/Maintenance.php";

class RequeueTranscodes extends Maintenance {

	public function __construct() {
		parent::__construct();
		$this->addOption( "file", "re-queue selected formats only for the given file", false, true );
		$this->addOption( "key", "re-queue for given format key", false, true );
		$this->addOption( "error", "re-queue formats that previously failed", false, false );
		$this->addOption( "stalled", "re-queue formats that were started but not finished",
			false, false );
		$this->addOption( "missing", "queue formats that were never started",
			false, false );
		$this->addOption( "all", "re-queue all output formats", false, false );
		$this->addOption( "audio", "process audio files (defaults to all media types)", false, false );
		$this->addOption( "video", "process video files (defaults to all media types)", false, false );
		$this->addOption( "throttle", "throttle on the queue", false, false );
		$this->mDescription = "re-queue existing and missing media transcodes.";
	}

	public function execute() {
		$this->output( "Cleanup transcodes:\n" );
		$dbr = wfGetDB( DB_REPLICA );
		$types = [];
		if ( $this->hasOption( 'audio' ) ) {
			$types[] = 'AUDIO';
		}
		if ( $this->hasOption( 'video' ) ) {
			$types[] = 'VIDEO';
		}
		if ( !$types ) {
			// Default to all if none specified
			$types = [ 'AUDIO', 'VIDEO' ];
		}
		$where = [ 'img_media_type' => $types ];
		if ( $this->hasOption( 'file' ) ) {
			$title = Title::newFromText( $this->getOption( 'file' ), NS_FILE );
			if ( !$title ) {
				$this->output( "Invalid --file option provided" );
				return;
			}
			$where['img_name'] = $title->getDBkey();
		}
		$res = $dbr->select( 'image', [ 'img_name' ], $where, __METHOD__ );
		foreach ( $res as $row ) {
			$title = Title::newFromText( $row->img_name, NS_FILE );
			$file = wfLocalFile( $title );
			$handler = $file ? $file->getHandler() : null;
			if ( $file && $handler && $handler instanceof TimedMediaHandler ) {
				$this->output( $file->getName() . "\n" );
				$this->processFile( $file );
			}
		}
		$this->output( "Finished!\n" );
	}

	public function processFile( File $file ) {
		$transcodeSet = WebVideoTranscode::enabledTranscodes();
		$dbw = wfGetDB( DB_MASTER );

		$state = WebVideoTranscode::cleanupTranscodes( $file );

		if ( $this->hasOption( "all" ) ) {
			$toAdd = $toRemove = $transcodeSet;
		} elseif ( $this->hasOption( "key" ) ) {
			$toAdd = $toRemove = [ $this->getOption( 'key' ) ];
		} else {
			$toAdd = $transcodeSet;
			$toRemove = [];
			$state = WebVideoTranscode::getTranscodeState( $file, $dbw );
			foreach ( $state as $key => $item ) {
				if ( $this->hasOption( 'error' ) && ( $item['time_error'] || !$item['time_addjob'] ) ) {
					$toRemove[] = $key;
					continue;
				}
				if ( $this->hasOption( 'stalled' ) &&
					( $item['time_addjob'] && !$item['time_success'] && !$item['time_error'] ) ) {
					$toRemove[] = $key;
					continue;
				}
				if ( $this->hasOption( 'missing' ) &&
					( !$item['time_addjob'] ) ) {
					$toRemove[] = $key;
					continue;
				}
			}
		}

		if ( $toRemove ) {
			$state = WebVideoTranscode::getTranscodeState( $file, $dbw );
			$keys = array_intersect( $toRemove, array_keys( $state ) );
			natsort( $keys );
			foreach ( $keys as $key ) {
				$this->output( ".. removing $key\n" );
				WebVideoTranscode::removeTranscodes( $file, $key );
			}
		}

		if ( $toAdd ) {
			$keys = $toAdd;
			$state = WebVideoTranscode::getTranscodeState( $file, $dbw );
			natsort( $keys );
			foreach ( $keys as $key ) {
				if ( !WebVideoTranscode::isTranscodeEnabled( $file, $key ) ) {
					// don't enqueue too-big files
					continue;
				}
				if ( !array_key_exists( $key, $state ) || !$state[$key]['time_addjob'] ) {
					$this->output( ".. queueing $key\n" );

					if ( $this->hasOption( 'throttle' ) ) {
						$startSize = WebVideoTranscode::getQueueSize( $file, $key );
					}

					WebVideoTranscode::updateJobQueue( $file, $key );
					if ( $this->hasOption( 'throttle' ) ) {
						while ( true ) {
							$size = WebVideoTranscode::getQueueSize( $file, $key );
							if ( $size > $startSize ) {
								$this->output( ".. waiting (queue size $size)\n" );
								sleep( 1 );
							} else {
								break;
							}
						}
					}
				}
			}
		}
	}
}

$maintClass = 'RequeueTranscodes'; // Tells it to run the class
require_once RUN_MAINTENANCE_IF_MAIN;
