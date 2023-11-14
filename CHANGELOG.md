# Release notes for project onepanel-gui


CHANGELOG
---------

### Latest changes

* VFS-11465 Added `region` and `verifyServerCertificate` parameters to S3 storage
* VFS-11251 Removed unused oneicons
* VFS-11202 Removed Embedded Ceph cluster configuration
* VFS-10480 Changed files to items in auto import scan report
* VFS-9303 Removed "over-modals" class from popover usages
* VFS-11081 Fixed incorrectly closing alert modals
* VFS-8257 Added closing modal on transition
* VFS-9257 Fixed ignored eslint issues
* VFS-10875 Handling large amount of storages and spaces in Oneprovider panel
* VFS-10563 Add record info with icon component to space table
* VFS-10886 Replaced browser service usages with Browser util
* VFS-10825 Fixed unnecessary scrollbars in Safari
* VFS-10411 Updated onedata-gui-common for better infinite scroll support
* VFS-9014 Migrated to getting globals from `globals` util
* VFS-10126 Using common addons from Marketplace branch
* VFS-10285 Added info popovers to membership
* VFS-8647 Moved component styles into dedicated directory
* VFS-9309 Removed usages of `:contains` jQuery selector
* VFS-8701 Removed ember-one-way-controls
* VFS-9196 Removed @module jsdoc
* VFS-10289 Added info popover about group
* VFS-10148 Removed redundant `done()` from tests
* VFS-10333 Unified naming of test suites
* VFS-9688 Removed arrow placement from one-tooltip
* VFS-10103 Changed showing clipboard in popovers info
* VFS-9999 Added detailed space details popovers with space information in various views
* VFS-10486 Removed custom zoom in tests rendering
* VFS-10442 Added eslint rule detecting wrong usage of hyphen in translations
* VFS-10312 Changed name conflict and disambiguation separator from "#" to "@"
* VFS-9129 Updated EmberJS to v3.8.3
* VFS-10261 Fixed loading only first 9 space cleaning reports on large screens
* VFS-9311 Removed `$.*width()`, `$.*height()`, `$.offset()` and `$.position()` usages
* VFS-10245 Added error translation for internal server error with reference
* VFS-10234 Made directory statistics enabled by default
* VFS-10092 Fixed randomly failing test in space cleaning reports
* VFS-10130 Added additional modal when turning on/off dir stats
* VFS-9312 Removed $.css() usages
* VFS-9313 Removed ":hidden" and ":visible" jQuery selectors usages
* VFS-9310 Removed $.parents() usages
* VFS-8656 Removed jQuery usage from login-related endpoints
* VFS-10107 Fixed smooth scroll in Chrome
* VFS-9795 Fixed user logout from Onezone GUI after remove from cluster members
* VFS-9623 Increased speed of SASS compilation and fixed its unnecessary recompilation
* VFS-9531 Updated gui common
* VFS-9637 Updated gui common
* VFS-9625 Fixed hiding tooltip when it is controlled manually
* VFS-9316 Removed usages of EmberPowerSelectHelper
* VFS-9394 Removed ember-browser-info
* VFS-9520 Changed sidebar look to be more compact
* VFS-9419 Added accounting and directory statistics options to space support
* VFS-9508 Updated EmberJS to v3.4.8
* VFS-9075 Fixed Term of use and privacy policy warnings
* VFS-9163 Fixed one-way-toggle spinner position
* VFS-9354 Fixed loading echarts library
* VFS-9207 Removed usage of local OpenSans fonts
* VFS-9013 Updated commons - using new color generator
* VFS-7717 Upgraded Babel to version 7.3, using EcmaScript 2019 for development
* VFS-8874 Removed bower and ember-spin-button
* VFS-6397 Removed redundant bower dependencies
* VFS-8521 Added support for NFS storage
* VFS-8800 Renamed "Local Ceph" storage type to "Embedded Ceph"
* VFS-7272 Changed let's encrypt form
* VFS-8568 Added automation main menu item
* VFS-8617 Removed usages of ember-invoke-action
* VFS-8574 Updated backend errors translations
* VFS-8704 Added "Clear formatting" button to WYSIWYG editors
* VFS-8631 Added terms of use to gui settings
* VFS-8608 Fixed buttons position on login page
* VFS-7380 Made storage form in readonly mode easier to copy
* VFS-8326 Added name and domain on login page
* VFS-8482 Fixed styles of H1 headers in privacy policy WYSIWYG editor
* VFS-8038 Refactored build process to support faster builds on CI
* VFS-8288 Updated commons: refactor of one-way-capacity
* VFS-7633 Updated infinite scroll implementation
* VFS-8053 Updated commons: refactor of id copiers in sidebar
* VFS-7661 Updated commons: timeout for connection check in clusters
* VFS-8081 Disabled "canonical" path type for Ceph RADOS storage type
* VFS-7713 Fixed validation of simulatedFilesystemParameters parameter in NullDevice storage
* VFS-7995 Added root UID and root GID fields to POSIX storage creation
* VFS-8034 Added max requests per session setting for HTTP storage
* VFS-7626 Show names of other providers in support table if available
* VFS-7738 Updated common libs: refactored navigation code
* VFS-7703 Added "Archive storage" option to S3 storage
* VFS-7666 Changed default value of S3 storage hostname
* VFS-7663 Changed login background image
* VFS-7523 Use new storage create API response with detailed error message
* VFS-7401 Updated commons
* VFS-7114 Do not allow to edit readonly QoS properties like providerId and storageId
* VFS-6663 Added options for copy provider ID and cluster ID/domain
* VFS-6638 Detecting unreachable duplicated clusters
* VFS-7281 Fixed scrolling to active items in sidebar
* VFS-7333 Updated commons
* VFS-7280 Fixed page reload after web certificate change
* VFS-6566 Updated commons
* VFS-7221 Fixed empty storage selector when supporting space
* VFS-7183 Showing storage IDs when there are multiple storages with the same name
* VFS-7202 Updated "bad data" backend error translation
* VFS-6802 Updated commons
* VFS-7042 Improved UX of storage import counters
* VFS-6745 Updated common libs
* VFS-7002 Added "Processed files", "Total storage files", "Unmodified files" and "Failed files" counters to storage import statistics
* VFS-7017 Fixed false locked state of toggles and false validation in storage edit form
* VFS-6973 Locking HTTP storage readonly and skip storage detection toggles to enabled state also when modifying storage
* VFS-6855 Using refactored Onepanel API (methods namespace change)
* VFS-6835 Sidebar items layout changed to use flexbox
* VFS-6874 Added "Block size" parameter to "Local Ceph" storage
* VFS-6872 Fixed auto cleaning reports tests on Chrome 84
* VFS-6860 Locking HTTP storage readonly and skip storage detection toggles always to enabled state
* VFS-6784 Redesigned toggling modification of storage
* VFS-6801 Disabled ceasing space support feature in favour of removing space in GUI
* VFS-6330 Redesigned storage import (formerly space synchronization) configuration
* VFS-6732 Using new monospace font
* VFS-6652 Enabled assets fingerprinting for more resources
* VFS-6697 Auto enable and lock skip storage detection in storage form
* VFS-6447 Redirect directly to other Onepanel cluster
* VFS-6612 Added readonly toggle to storage creation form
* VFS-6625 S3 storage credentials made optional
* VFS-6536 Changed default fileMode for S3, HTTP and Webdav storages
* VFS-6521 Added HTTP storage helper
* VFS-6454 Added XRootD storage helper
* VFS-6498 Allow to change import toggle in space when storage is import-enabled
* VFS-6437 Updated Onepanel JS client
* VFS-6352 Changed LUMA-related options in the storage form
* VFS-6344 Updated common libs
* VFS-6381 Fixed build process
* VFS-6343 Changed cease support modal to Onezone version
* VFS-6323 Updated common libs
* VFS-6324 Updated common libs
* VFS-5980 Unified Oneprovider GUI Service Pack 2
* VFS-6299 Fixed page reload after certificate generation
* VFS-5899 Updated common libs
* VFS-6145 Updated common libs
* VFS-5929 Updated common libs
* VFS-6176 Updated common libs
* VFS-6115 Fixed common issues for embedded Oneprovider GUI Service Pack 1
* VFS-5767 Fixed not working deployment view after Oneprovider deregistration
* VFS-5767 Updated common libs
* VFS-5988 Added shares sidebar entry
* VFS-6109 Added trimming to token inputs
* VFS-6056 Added resetting navigation state on logout
* VFS-6024 Removed default space and default Oneprovider features
* VFS-6041 Added info about deprecation of Ceph storage
* VFS-5781 Updated common libs
* VFS-5650 Added "Maximum canonical object size", "File mode" and "Directory mode" options to S3 storage
* VFS-5897 New backend error handlers
* VFS-5871 Moved option "Mount in root" from space support to "Imported storage" in storage
* VFS-5916 Fixed sending Onezone configuration on deploy
* VFS-5878 Added warning modal about clearing OSD devices on Ceph deploy
* VFS-5890 Removed Ceph related requests from Onezone Onepanel
* VFS-5493 Added QoS parameters to storages
* VFS-5020 Added Ceph cluster deployment and management
* VFS-5875 Fixed navigation in GUI settings aspect and updated DOMPurify
* VFS-1891 Added setting privacy policy, cookie consent notification and sign-in notification
* VFS-5703 Fixed validation of space auto-cleaning form
* VFS-5702 Minimized number of requests related to cluster configuration
* VFS-5499 Fixed displaying errors, when oz/op-worker service is not working
* VFS-5667 Fixed service info element placement
* VFS-5664 Fixed pointer events handling
* VFS-5549 Fixed incorrect trimming of cluster registration token
* VFS-5465 Common libraries update
* VFS-5599 Added support for Onepanel Proxy URL
* VFS-3335 Added storage edition and deletion
* VFS-5519 Fixed not visible block with service version in Safari
* VFS-5476 Refactoring of token/origin endpoints and unified GUI URL
* VFS-5496 Added notification about no linked Onezone user
* VFS-5219 Common libraries update
* VFS-5452 Fixed not working cluster deployment GUI after SP3 changes
* VFS-5425 Service Pack 3 for unified GUI
* VFS-5411 Basic-auth sign-in changed to emergency passphrase
* VFS-5377 Simple members view in emergency mode of Onepanel GUI
* VFS-4640 Added auto-polling of space occupancy, disabled join space in emergency, changed session expired message
* VFS-5301 Fixed disabled submit button in WebDAV storage on no POSIX mode
* VFS-5301 Added new WebDAV configuration fields
* VFS-4596 Major changes to support unified and standalone Onepanel GUI
* VFS-5242 Using new async backend to show progress of saving file popularity settings
* VFS-5187 Fixed some graphical issues in supported spaces view; onepanel client library update
* VFS-5114 Infinite-scroll list of auto-cleaning reports, file-popularity options and major refactor of space support views
* VFS-5153 Added DNS autodetect option
* VFS-5070 Added new conditions and using refactored API for auto-cleaning
* VFS-4919 Added support for WebDAV storage
* VFS-4870 New style for modals
* VFS-4798 Fixed redirect modal not shown after provider domain change and provider data refresh after cluster aspect change
* VFS-4865 Added space support size change feature
* VFS-4700 Added DNS check and Onezone DNS configuration views
* VFS-4385 Fixed not updating storage sync charts after import finish and enabling update
* VFS-4663 Web certificate management
* VFS-4677 Added Ceph RADOS storage support
* VFS-4463 Showing storage ID on storages view
* VFS-4233 Using submodules for own libs on separate repos
* VFS-4629 Fixed translations
* VFS-4559 Fixed global actions display in mobile view
* VFS-4587 Fixing lack of space occupancy bar by updating onepanel client
* VFS-4594 UX improvements of deployment process
* VFS-4435 New feature: adding hosts in cluster deployment table
* VFS-4436 Added view for registering first admin user
* VFS-4424 Improved sidebar content presentation and animation
* VFS-4381 Removed signature version option from S3 storage form, because we support only V4
* VFS-4380 Added new parameters in null device form: simulated filesystem paramers and grow speed
* VFS-4356 Improvements in navigation related to incorrect URLs
* VFS-4241 Polling for synchronization statistics with higher frequency.
* VFS-4210 New layout for main menu in desktop view mode
* VFS-4259 Fixing not working create new cluster button
* VFS-4229 Merged recent changes of onedata-gui-common library (ia. improved mobile view, styles improvements)
* VFS-4027 Added support for peta-, exa-, zetta- and yottabytes
* VFS-4206 Added capability to display speed in bit/s (ported)
* VFS-4197 Added "storage path type" option for storages
* VFS-4097 Added cluster IPs configuration step and view for changing IPs after deployment
* VFS-4125 Fixed lack of integrity check for CSS files
* VFS-3968 Update to EmberJS 2.18.0
* VFS-3985 Added a bar chart, that shows storage usage for a space
* VFS-4016 Added NullDevice storage support
* VFS-3986 Added Let's Encrypt certificate setup step in provider cluster deployment; improved error backend error descriptions
* VFS-3571 Common libraries update
* VFS-3955 Better truncating of too long names in sidebar, sidebar buttons
* VFS-3619 Refactor of login page components
* VFS-3205 Improvements in displaying deployment steps
* VFS-3636 Fix for invalid date in synchronization statistics charts
* VFS-3202 Try to detect unfinished cluster deployment on page refresh
* VFS-3870 Show notify after space support settings change
* VFS-3706 Do not allow to enter improper routes in panel (fixes also VFS-3895: PATCH request after provider deregistration)
* VFS-3928 Less restrictive validation of provider/onezone domain name
* VFS-3592 Added common favicon
* VFS-3883 Porting recent improvements in common components and utils from op-gui-default
* VFS-3677 Fix for tooltip positioning in mobile view
* VFS-3741 Fix for import chart tooltip positioning and overflow handling in mobile view
* VFS-3882 Fixed space auto-cleaning report status tooltips; deregister provider message update
* VFS-3606 Subdomain delegation functionality for provider
* VFS-3661 Improvements in presenting loading state of views and errors
* VFS-3685 Added space files popularity and space auto cleaning views
    * redesigned single space view to use tabs (sync. stats, files pop., space auto cleaning)
* VFS-3710 Using binary prefix units for displaying sizes (MiB, GiB, etc.)
* VFS-3621 Fixing design of show error component
* VFS-3620 Showing conflits in names of spaces
* VFS-3449 Added sync ACL option to import/update settings
* VFS-3478, VFS-3554 List of providers per space with support size
* VFS-3524, VFS-3569 Chart component for space support size per provider
* VFS-3450 Update to EmberJS 2.14.1; Major code refactor: using onedata-gui-common in-repo addon
* VFS-3298 Fixed EmberJS deprecations, tidied usage of addons
* VFS-3341 Toggles can now be activated with swipe
* VFS-3374 Improvements in form fields validation
* VFS-3398 Added application loader spinner and error messages


### 17.06.0-rc2

* No changes in GUI since 17.06.0-rc1


### 17.06.0-rc1

* VFS-3521 Libraries update: ember-bootstrap, ember-power-select
* VFS-3274 Dynamic transformation of popover into modal in mobile view
* VFS-3367 Support for reverse LUMA
* VFS-3375 Styles improvements in mobile mode
* VFS-3440 Fixed issues with bar and axis label display in import statistics charts


### 17.06.0-beta1 - 17.06.0-beta6

* VFS-3411 Showing space mount in root setting for space
* VFS-3423 Showing all information about registered storage
* VFS-3389 Listing supported spaces for storage
* VFS-3406 Showing panel type on login screen; new graphics
* VFS-3283 Charts presenting storage synchronization statistics
* VFS-3283 Chart presenting storages supporting space
* VFS-3250 Added GlusterFS support
* VFS-3227 Storage synchronization (import and update) support
* VFS-3275, VFS-3276 Improved styles for popovers and tooltips and main menu
* VFS-3277 Fixed glitches in views with no resources


### 3.0.0-rc15

* New EmberJS-based version of Onepanel GUI


________

Generated by sr-release.
