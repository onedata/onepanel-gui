# Release notes for project onepanel-gui


CHANGELOG
---------

### Latest changes

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
* VFS-5493 Added QOS parameters to storages
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
