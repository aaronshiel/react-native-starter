
.PHONY: fastlane-ios-beta
fastlane-ios-beta:
	cd ios && make beta

.PHONY: develop
develop:
	watchman && npm start
